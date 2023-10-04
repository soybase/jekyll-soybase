USER = $(shell id -un)
ifneq (,filter-out(code vscode,$(USER)))
  OS = $(shell uname)
  ifeq ($(OS), Darwin)
    # additional macOS environment variable needed at install time due to broken
    # xcode ruby framework
    export CPATH = /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/System/Library/Frameworks/Ruby.framework/Versions/2.6/Headers/
  endif
  # install Ruby dependencies in $PWD/vendor
  export GEM_HOME=${PWD}/vendor/gems
  export PATH := ${PWD}/vendor/gems/bin:${PATH}

  JEKYLL_SERVE_ARGS = --livereload
  PYTHON_VENV_ACTIVATE = . ./vendor/python-venv/bin/activate
else # assume dev container
  NPM_INSTALL_OPTIONS = -g
  PYTHON_VENV_ACTIVATE = true # no-op
endif

JBROWSE_VERSION = 2.6.3

serve: mostlyclean setup
	bundle exec jekyll serve --profile --trace --incremental $(JEKYLL_SERVE_ARGS)

check: mostlyclean setup yamllint htmlproofer

yamllint:
	$(PYTHON_VENV_ACTIVATE) && yamllint .

htmlproofer:
	bundle exec jekyll build --profile --trace
	case $$(gem list -q html-proofer) in *4.4.3*) optarg='=true';; esac; \
	bundle exec htmlproofer --allow-missing-href$${optarg:-} --ignore-missing-alt$${optarg:-} --cache '{"timeframe": {"external": "30d"}}' --ignore-status-codes 503 --ignore-files '/\/uikit\/tests\//' --log-level debug ./_site

# JBrowse CLI will already be installed globally if using a dev container
jbrowse: setup
	rm -f assets/js/jbrowse/config.json
	npm exec -c '_scripts/jbrowse-tracks.sh'

setup:
	git submodule update --init --recursive
	if ! bundle check; then bundle install; fi
	if ! { command -v jbrowse || npm ls @jbrowse/cli ; } >/dev/null 2>&1; then npm install $(NPM_INSTALL_OPTIONS) @jbrowse/cli@${JBROWSE_VERSION}; fi
	if ! [ -d ./assets/js/jbrowse ]; then npx jbrowse create assets/js/jbrowse --tag=v${JBROWSE_VERSION}; fi
	if ! ( $(PYTHON_VENV_ACTIVATE) ); then python3 -mvenv ./vendor/python-venv; fi
	$(PYTHON_VENV_ACTIVATE) && pip3 install --no-cache-dir -r requirements.txt

mostlyclean:
	rm -rf .jekyll-cache/ .jekyll-metadata _site/ tmp/

clean: mostlyclean
	rm -rf ./assets/js/jbrowse Gemfile.lock $${PWD}/vendor package.json package-lock.json node_modules
