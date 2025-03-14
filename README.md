# soybase.org
This repository holds the [Jekyll](https://jekyllrb.com/) site hosted at www.soybase.org.

## Deployment
Commits to the `main` branch will trigger a GitHub Action workflow that build the static site & deploy to the dev.soybase.org branch.
This branch is hosted via GitHub Pages at https://dev.soybase.org.

When a tag is pushed, a GitHub Action workflow will build the static site & deploy to the [soybase/soybase.org](https://github.com/soybase/soybase.org) repository.
This branch is hosted via GitHub Pages at https://www.dev.soybase.org.

## Development
### Local (macOS)

1. Install XCode Developer Tools (if not already installed):

```console
xcode-select --install
```

2. Install [Node.js](https://nodejs.org/) version >= 16.

3. Clone the repository:

```console
git clone https://github.com/soybase/jekyll-soybase.git
```

### Dev Container (GitHub Codespaces or VS Code)
When creating a [GitHub Codespace](https://github.com/features/codespaces) on a branch, or using VS Code locally with a Docker engine installed (e.g., Docker Desktop or Rancher Desktop), a [Dev Container](https://containers.dev/) has been defined (at [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json)) to automatically set up Ruby and NodeJS.

### Building the Site
The following methods will run the site on your computer at http://localhost:4000/.
Changes made to HTML/Liquid files will be immediately reflected in the browser due to [LiveReload](http://livereload.com/) (*when running a codespace in the browser, LiveReload does not work; a browser reload is necessary to reflect any changes made to the site*).
Changes made to other file types (e.g., data and config files) may only be reflected the next time `make` is run.


```sh
make jbrowse # (optional; slow!) install JBrowse dependencies if needed
             # & run _scripts/jbrowse-tracks.sh to generate JBrowse config.json
make         # install dependencies if needed & start jekyll server listening on localhost:4000
... CTRL-C ...
make check   # build site & check for broken links, accessibility issues, and YAML lint errors
             # or "make htmlproofer", "make pa11y", and "make yamllint" separately

# make clean : remove everything installed/created by `make jbrowse` and `make`
```

## Theme
This site uses a modified version of the [Legume Information System Jekyll theme](https://github.com/legumeinfo/jekyll-theme-legumeinfo).

## News Posts
News posts are plain text markdown with a YAML header, created by adding a file under `news/_posts/` with a name of the format `yyyy-mm-dd-unique-identifier.md`.
For example:
```
---
layout: news-item
title: Tepary bean genomes added to LIS
author: Sam Hokin
date: 2021-10-01 17:00
summary: Phaseolus acutifolius (tepary bean) added to LIS
---
[Phaseolus acutifolius (tepary bean)](/taxa/phaseolus) is a drought- and heat-tolerant crop
native to the American Southwest and Mexico; it joins the growing set of annotated genomes at LIS,
with a cultivated and wild accession described in [Moghaddam et al. 2021](https://doi.org/10.1038/s41467-021-22858-x).
The cultivated accession has been added as the primary representative of the species.
```
You can place blank lines in the content to generate paragraphs. Images are not supported in news items.

## Announcements
Announcements are just like news posts, created by adding a file under `announcements/_posts` with a name of the format `yyyy-mm-dd-unique-identifier.md`.
For example:
```
---
layout: announcement-item
title: BIC & NAPIA Biennial meeting 2-4 November, 2021 (virtual)
author: Sam Hokin
date: 2021-11-02
summary: BIC & NAPIA Biennial meeting will be held virtually, 2-4 November, 2021
---
2 - 4 November 2021:
[BIC & NAPIA Biennial meeting](https://www.bic-napia.org/), Virtual Meeting
```
You can place blank lines in the content to generate paragraphs. Images are not supported in announcements.

## Blog Posts
Blog posts are created by adding a file named `blog/_posts/yyyy-mm-dd-unique-identifier.md`.

A blog post has a YAML header which provides key information. For example, a post with the filename `2018-09-10-macrosynteny-gcv.md` has the following header:
```
---
layout: blog-item
title: Bringing Macrosynteny to the GCV Multi-view
author: Andrew Farmer
date: 2018-09-10
summary: The multi-alignment view of the Genome Context Viewer has been updated to support visualization of multi-way macrosynteny between the chromosomes from which microsyntenic segments were taken.
---
```
The resulting blog URL generated for this post is then `/blog/2018/09/10/macrosynteny-gcv.html`. The main `/blog` page provides a list of blog posts, most recent first.

The blog content is plain text entered below the header. Blank lines will generate paragraph tags in the generated HTML as you'd wish. However, a bit more work is required to place
images in your post:

 - place the image file under `assets/img/blog_images/`
 - use the normal HTML img tag in your content
 - wrap the image inside a `blog-image` div (so we have consistent placement, margins, and border)
 - wrap optional attribution in a `attribution` div below the image
 
Here's an example of a short post with an image which includes attribution:
```
The Genomic Context Viewer (GCV) is a web application that provides interactive and synchronized comparative genomics visualizations.

<div class="blog-image">
  <img src="/assets/img/blog_images/instructions-gcv.gif" alt="Screen capture of the GCV user interface"/>
  <div class="attribution">&copy; 2018 NCGR</div>
</div>

Comparisons are performed by determining conservation of gene order and orientation across related species or individuals using homology based on gene family assignments....
```
