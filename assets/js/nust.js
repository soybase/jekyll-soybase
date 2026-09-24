/**
 * SoyBase Northern Uniform Soybean Trials (NUST) Portal
 * API Client & Dynamic UI Controller
 */

(function () {
    'use strict';

    // Determine API Base URL
    const urlParams = new URLSearchParams(window.location.search);
    const apiParam = urlParams.get('api');
    const API_BASE = (apiParam ? apiParam.replace(/\/+$/, '') : (window.NUST_API_URL || 'https://nust.soybase.org')).replace(/\/+$/, '');

    let exampleStrainNames = ['IA3023', 'MN1410'];
    let activeDataTables = [];
    let currentPhenotypeParams = null;
    let currentPhenotypeResults = null;
    let lastActiveToolId = 'general-phenotype-search';

    // Smooth scroll to the top of a container taking sticky header into account
    function scrollToElement(el) {
        if (!el) return;
        const navbar = document.getElementById('navbar');
        const navHeight = navbar ? navbar.getBoundingClientRect().height : 0;
        const y = el.getBoundingClientRect().top + window.pageYOffset - navHeight - 15;
        window.scrollTo({
            top: Math.max(0, y),
            behavior: 'smooth'
        });
    }

    // Display alert  banner
    function showAlert(message, type = 'danger') {
        const container = document.getElementById('nust-alert-container');
        if (container) {
            container.innerHTML = `
                <div class="uk-alert uk-alert-${type} uk-animation-fade" uk-alert>
                    <a class="uk-alert-close" uk-close></a>
                    <p><strong>${type === 'danger' ? 'Error' : 'Notice'}:</strong> ${message}</p>
                </div>
            `;
            scrollToElement(container);
        } else if (window.UIkit && UIkit.notification) {
            UIkit.notification({ message, status: type, pos: 'top-center', timeout: 5000 });
        } else {
            alert(message);
        }
    }

    function clearAlert() {
        const container = document.getElementById('nust-alert-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    function showResultsLoader(msg = 'Fetching phenotypic observations and formatting data tables...', toolId, title = 'Querying NUST Database') {
        clearAlert();
        if (toolId) lastActiveToolId = toolId;
        const searchInterface = document.getElementById('nust-search-interface');
        const resultsContainer = document.getElementById('results-container');
        const resultsContent = document.getElementById('results-content');
        const resultsLoader = document.getElementById('results-loader');

        if (searchInterface) searchInterface.setAttribute('hidden', 'hidden');
        if (resultsContainer) resultsContainer.removeAttribute('hidden');
        if (resultsLoader) {
            resultsLoader.removeAttribute('hidden');
            const titleEl = resultsLoader.querySelector('.uk-card-title') || resultsLoader.querySelector('.nust-loader-title');
            if (titleEl) titleEl.textContent = title;
            const textEl = resultsLoader.querySelector('.loader-text');
            if (textEl) textEl.textContent = msg;
        }
        if (resultsContent) resultsContent.innerHTML = '';
        const topEl = document.getElementById('nust-header') || resultsContainer;
        scrollToElement(topEl);
    }

    function hideResultsLoader() {
        const resultsLoader = document.getElementById('results-loader');
        if (resultsLoader) resultsLoader.setAttribute('hidden', 'hidden');
    }

    // Generic JSON Fetch with Timeout and Error Handling
    async function apiRequest(endpoint, method = 'GET', data = null) {
        const url = `${API_BASE}${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Accept': 'application/json'
            }
        };

        if (data) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Too many requests have been made to the NUST service. Please wait a few minutes and try again.');
            }

            const contentType = response.headers.get('content-type') || '';
            let json = null;
            if (contentType.includes('application/json')) {
                json = await response.json();
            }

            if (!response.ok) {
                const errMsg = (json && (json.message || json.error)) || `Server returned status ${response.status} (${response.statusText})`;
                throw new Error(errMsg);
            }

            return json;
        } catch (err) {
            console.error(`API error at ${endpoint}:`, err);
            throw err;
        }
    }

    // Populate select element preserving placeholder and 'ALL' option
    function populateSelect(selectEl, items, valueKey = null, textKey = null, sortAlphabetical = false) {
        if (!selectEl) return;

        // Keep first 2 options (placeholder and ALL)
        while (selectEl.options.length > 2) {
            selectEl.remove(2);
        }

        if (!items || !items.length) return;

        let list = [...items];
        if (sortAlphabetical) {
            list.sort((a, b) => {
                const strA = typeof a === 'object' ? (a[textKey] || a[valueKey] || '') : String(a);
                const strB = typeof b === 'object' ? (b[textKey] || b[valueKey] || '') : String(b);
                return strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
            });
        }

        list.forEach(item => {
            const val = typeof item === 'object' && valueKey ? item[valueKey] : item;
            const txt = typeof item === 'object' && textKey ? item[textKey] : item;
            // Prevent duplicates
            if (!selectEl.querySelector(`option[value="${val}"]`)) {
                const opt = document.createElement('option');
                opt.value = val;
                opt.textContent = txt;
                selectEl.appendChild(opt);
            }
        });
    }

    // Clear options down to first 2
    function resetSelectOptions(selectEl) {
        if (!selectEl) return;
        while (selectEl.options.length > 2) {
            selectEl.remove(2);
        }
        selectEl.selectedIndex = -1;
    }

    // Destroy existing DataTables
    function destroyDataTables() {
        activeDataTables.forEach(dt => {
            try {
                if ($.fn.DataTable.isDataTable(dt)) {
                    $(dt).DataTable().destroy();
                }
            } catch (e) {
                console.warn('Error destroying datatable:', e);
            }
        });
        activeDataTables = [];
    }

    // Initialize Page & Event Listeners
    document.addEventListener('DOMContentLoaded', async function () {
        // Elements - Tool 1 (General Phenotype)
        const yearSelect1 = document.getElementById('year-select1');
        const testSelect1 = document.getElementById('test-select1');
        const locationSelect1 = document.getElementById('location-select1');
        const strainSelect1 = document.getElementById('strain-select1');
        const phenotypeSelect1 = document.getElementById('phenotype-select1');
        const retrieveBtn1 = document.getElementById('retrieve-results1');

        // Elements - Tool 2 (Strain Search)
        const strainInput2 = document.getElementById('strain-input2');
        const retrieveBtn2 = document.getElementById('retrieve-results2');

        // Elements - Tool 3 (Specific Strain Phenotype)
        const yearSelect3 = document.getElementById('year-select3');
        const testSelect3 = document.getElementById('test-select3');
        const locationSelect3 = document.getElementById('location-select3');
        const phenotypeSelect3 = document.getElementById('phenotype-select3');
        const strainInput3 = document.getElementById('strain-input3');
        const retrieveBtn3 = document.getElementById('retrieve-results3');

        // Elements - Tool 4 (Common Test)
        const strainInput4 = document.getElementById('strain-input4');
        const retrieveBtn4 = document.getElementById('retrieve-results4');

        // Load initial metadata from GET /
        try {
            const meta = await apiRequest('/');
            if (meta && meta.years && Array.isArray(meta.years)) {
                // Populate year selects (keeping placeholder)
                [yearSelect1, yearSelect3].forEach(sel => {
                    if (!sel) return;
                    while (sel.options.length > 1) {
                        sel.remove(1);
                    }
                    meta.years.forEach(yr => {
                        const opt = document.createElement('option');
                        opt.value = yr;
                        opt.textContent = yr;
                        sel.appendChild(opt);
                    });
                });
            }
            if (meta && meta.exampleStrainNames && meta.exampleStrainNames.length) {
                exampleStrainNames = meta.exampleStrainNames;
            }
        } catch (err) {
            console.error('Failed to load initial metadata from NUST API:', err);
            showAlert(`Unable to load initial trial data from NUST API (${API_BASE}). ${err.message}`, 'warning');
        }

        // ==========================================
        // Helper: Check validation for Tool 1 & 3
        // ==========================================
        function checkValidation1() {
            if (!retrieveBtn1) return;
            const valid = yearSelect1.selectedOptions.length > 0 &&
                testSelect1.selectedOptions.length > 0 &&
                locationSelect1.selectedOptions.length > 0 &&
                strainSelect1.selectedOptions.length > 0 &&
                phenotypeSelect1.selectedOptions.length > 0;
            retrieveBtn1.disabled = !valid;
        }

        function checkValidation3() {
            if (!retrieveBtn3) return;
            const hasStrains = strainInput3 && strainInput3.value.trim().length > 0;
            const valid = hasStrains &&
                yearSelect3.selectedOptions.length > 0 &&
                testSelect3.selectedOptions.length > 0 &&
                locationSelect3.selectedOptions.length > 0 &&
                phenotypeSelect3.selectedOptions.length > 0;
            retrieveBtn3.disabled = !valid;
        }

        // ==========================================
        // Tool 1 Cascading Select Handlers
        // ==========================================
        if (yearSelect1) {
            yearSelect1.addEventListener('change', async function () {
                const selectedYears = Array.from(yearSelect1.selectedOptions)
                    .map(o => parseInt(o.value))
                    .filter(v => !isNaN(v));

                resetSelectOptions(testSelect1);
                resetSelectOptions(locationSelect1);
                resetSelectOptions(strainSelect1);
                resetSelectOptions(phenotypeSelect1);
                checkValidation1();

                if (!selectedYears.length) return;

                try {
                    const tests = await apiRequest('/data/tests', 'POST', { years: selectedYears });
                    populateSelect(testSelect1, tests, null, null, true);
                } catch (e) {
                    showAlert('Error fetching tests for selected years: ' + e.message);
                }
            });
        }

        if (testSelect1) {
            testSelect1.addEventListener('change', async function () {
                const selectedYears = Array.from(yearSelect1.selectedOptions).map(o => parseInt(o.value)).filter(v => !isNaN(v));
                const selectedTests = Array.from(testSelect1.selectedOptions).map(o => o.value);

                resetSelectOptions(locationSelect1);
                resetSelectOptions(strainSelect1);
                resetSelectOptions(phenotypeSelect1);
                checkValidation1();

                if (!selectedTests.length) return;

                try {
                    const locations = await apiRequest('/data/locations', 'POST', { years: selectedYears, tests: selectedTests });
                    // Locations are { city, state }
                    const formatted = locations.map(l => ({
                        value: `${l.city},${l.state}`,
                        text: `${l.city}, ${l.state}`,
                        state: l.state,
                        city: l.city
                    })).sort((a, b) => a.state.localeCompare(b.state) || a.city.localeCompare(b.city));

                    populateSelect(locationSelect1, formatted, 'value', 'text', false);
                } catch (e) {
                    showAlert('Error fetching locations: ' + e.message);
                }
            });
        }

        if (locationSelect1) {
            locationSelect1.addEventListener('change', async function () {
                const selectedYears = Array.from(yearSelect1.selectedOptions).map(o => parseInt(o.value)).filter(v => !isNaN(v));
                const selectedTests = Array.from(testSelect1.selectedOptions).map(o => o.value);
                const locValues = Array.from(locationSelect1.selectedOptions).map(o => o.value);
                const selectedCities = locValues.includes('ALL') ? ['ALL'] : locValues.map(v => v.split(',')[0]);

                resetSelectOptions(strainSelect1);
                resetSelectOptions(phenotypeSelect1);
                checkValidation1();

                if (!locValues.length) return;

                try {
                    const strains = await apiRequest('/data/strains', 'POST', {
                        years: selectedYears,
                        tests: selectedTests,
                        cities: selectedCities
                    });
                    populateSelect(strainSelect1, strains, 'strain', 'strain', true);
                } catch (e) {
                    showAlert('Error fetching strains: ' + e.message);
                }
            });
        }

        if (strainSelect1) {
            strainSelect1.addEventListener('change', async function () {
                const selectedYears = Array.from(yearSelect1.selectedOptions).map(o => parseInt(o.value)).filter(v => !isNaN(v));
                const selectedTests = Array.from(testSelect1.selectedOptions).map(o => o.value);
                const locValues = Array.from(locationSelect1.selectedOptions).map(o => o.value);
                const selectedCities = locValues.includes('ALL') ? ['ALL'] : locValues.map(v => v.split(',')[0]);
                const selectedStrains = Array.from(strainSelect1.selectedOptions).map(o => o.value);

                resetSelectOptions(phenotypeSelect1);
                checkValidation1();

                if (!selectedStrains.length) return;

                try {
                    const phenotypes = await apiRequest('/data/phenotypes', 'POST', {
                        years: selectedYears,
                        tests: selectedTests,
                        cities: selectedCities,
                        strains: selectedStrains
                    });
                    populateSelect(phenotypeSelect1, phenotypes, 'phenotype', 'phenotype', true);
                } catch (e) {
                    showAlert('Error fetching phenotypes: ' + e.message);
                }
            });
        }

        if (phenotypeSelect1) {
            phenotypeSelect1.addEventListener('change', checkValidation1);
        }

        // ==========================================
        // Tool 3 Cascading Select Handlers
        // ==========================================
        if (yearSelect3) {
            yearSelect3.addEventListener('change', async function () {
                const selectedYears = Array.from(yearSelect3.selectedOptions).map(o => parseInt(o.value)).filter(v => !isNaN(v));

                resetSelectOptions(testSelect3);
                resetSelectOptions(locationSelect3);
                resetSelectOptions(phenotypeSelect3);
                checkValidation3();

                if (!selectedYears.length) return;

                try {
                    const tests = await apiRequest('/data/tests', 'POST', { years: selectedYears });
                    populateSelect(testSelect3, tests, null, null, true);
                } catch (e) {
                    showAlert('Error fetching tests: ' + e.message);
                }
            });
        }

        if (testSelect3) {
            testSelect3.addEventListener('change', async function () {
                const selectedYears = Array.from(yearSelect3.selectedOptions).map(o => parseInt(o.value)).filter(v => !isNaN(v));
                const selectedTests = Array.from(testSelect3.selectedOptions).map(o => o.value);

                resetSelectOptions(locationSelect3);
                resetSelectOptions(phenotypeSelect3);
                checkValidation3();

                if (!selectedTests.length) return;

                try {
                    const locations = await apiRequest('/data/locations', 'POST', { years: selectedYears, tests: selectedTests });
                    const formatted = locations.map(l => ({
                        value: `${l.city},${l.state}`,
                        text: `${l.city}, ${l.state}`,
                        state: l.state,
                        city: l.city
                    })).sort((a, b) => a.state.localeCompare(b.state) || a.city.localeCompare(b.city));

                    populateSelect(locationSelect3, formatted, 'value', 'text', false);
                } catch (e) {
                    showAlert('Error fetching locations: ' + e.message);
                }
            });
        }

        if (locationSelect3) {
            locationSelect3.addEventListener('change', async function () {
                const selectedYears = Array.from(yearSelect3.selectedOptions).map(o => parseInt(o.value)).filter(v => !isNaN(v));
                const selectedTests = Array.from(testSelect3.selectedOptions).map(o => o.value);
                const locValues = Array.from(locationSelect3.selectedOptions).map(o => o.value);
                const selectedCities = locValues.includes('ALL') ? ['ALL'] : locValues.map(v => v.split(',')[0]);

                let selectedStrains = ['ALL'];
                if (strainInput3 && strainInput3.value.trim()) {
                    selectedStrains = strainInput3.value.split('\n').map(s => s.trim()).filter(Boolean);
                }

                resetSelectOptions(phenotypeSelect3);
                checkValidation3();

                if (!locValues.length) return;

                try {
                    const phenotypes = await apiRequest('/data/phenotypes', 'POST', {
                        years: selectedYears,
                        tests: selectedTests,
                        cities: selectedCities,
                        strains: selectedStrains
                    });
                    populateSelect(phenotypeSelect3, phenotypes, 'phenotype', 'phenotype', true);
                } catch (e) {
                    showAlert('Error fetching phenotypes: ' + e.message);
                }
            });
        }

        if (phenotypeSelect3) {
            phenotypeSelect3.addEventListener('change', checkValidation3);
        }

        // ==========================================
        // Textareas & Example Strain Buttons
        // ==========================================
        if (strainInput2) {
            strainInput2.addEventListener('input', () => {
                if (retrieveBtn2) retrieveBtn2.disabled = !strainInput2.value.trim();
            });
        }

        if (strainInput3) {
            strainInput3.addEventListener('input', () => {
                checkValidation3();
            });
        }

        if (strainInput4) {
            strainInput4.addEventListener('input', () => {
                if (retrieveBtn4) retrieveBtn4.disabled = !strainInput4.value.trim();
            });
        }

        // Example buttons
        document.querySelectorAll('.example-strain-button').forEach(btn => {
            btn.addEventListener('click', function () {
                const targetId = this.getAttribute('data-target');
                const textarea = document.getElementById(targetId);
                if (textarea) {
                    textarea.value = exampleStrainNames.join('\n');
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        });

        // ==========================================
        // File Upload Dropzones
        // ==========================================
        function setupDropzone(dropzoneId, fileInputId, textareaId, progressBarId) {
            const dropzone = document.getElementById(dropzoneId);
            const fileInput = document.getElementById(fileInputId);
            const textarea = document.getElementById(textareaId);
            const progressBar = document.getElementById(progressBarId);

            if (!dropzone || !fileInput || !textarea) return;

            function processFile(file) {
                if (!file) return;
                if (file.type && !file.type.includes('text') && !file.name.endsWith('.txt')) {
                    showAlert('Only plain text (.txt) files are supported.', 'warning');
                    return;
                }

                if (progressBar) {
                    progressBar.removeAttribute('hidden');
                    progressBar.value = 30;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    textarea.value = e.target.result;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    if (progressBar) {
                        progressBar.value = 100;
                        setTimeout(() => progressBar.setAttribute('hidden', 'hidden'), 800);
                    }
                };
                reader.onerror = function () {
                    showAlert('Failed to read uploaded file.');
                    if (progressBar) progressBar.setAttribute('hidden', 'hidden');
                };
                reader.readAsText(file);
            }

            fileInput.addEventListener('change', function () {
                if (this.files && this.files[0]) {
                    processFile(this.files[0]);
                }
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                dropzone.addEventListener(eventName, e => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.add('uk-dragover');
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropzone.addEventListener(eventName, e => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.remove('uk-dragover');
                }, false);
            });

            dropzone.addEventListener('drop', e => {
                const dt = e.dataTransfer;
                if (dt && dt.files && dt.files[0]) {
                    processFile(dt.files[0]);
                }
            });
        }

        setupDropzone('strain-file-dropzone2', 'strain-file2', 'strain-input2', 'strain-progressbar');
        setupDropzone('strain-file-dropzone3', 'strain-file3', 'strain-input3', 'specific-strain-progressbar');
        setupDropzone('strain-file-dropzone4', 'strain-file4', 'strain-input4', 'common-test-progressbar');

        // ==========================================
        // Reset Buttons
        // ==========================================
        document.querySelectorAll('.reset-button').forEach(btn => {
            btn.addEventListener('click', function () {
                const formId = this.getAttribute('data-form');
                if (formId === 'general-phenotype-form') {
                    if (yearSelect1) yearSelect1.selectedIndex = -1;
                    resetSelectOptions(testSelect1);
                    resetSelectOptions(locationSelect1);
                    resetSelectOptions(strainSelect1);
                    resetSelectOptions(phenotypeSelect1);
                    if (retrieveBtn1) retrieveBtn1.disabled = true;
                } else if (formId === 'strain-search-form') {
                    if (strainInput2) strainInput2.value = '';
                    const f = document.getElementById('strain-file2');
                    if (f) f.value = '';
                    if (retrieveBtn2) retrieveBtn2.disabled = true;
                } else if (formId === 'specific-strain-phenotype-form') {
                    if (yearSelect3) yearSelect3.selectedIndex = -1;
                    resetSelectOptions(testSelect3);
                    resetSelectOptions(locationSelect3);
                    resetSelectOptions(phenotypeSelect3);
                    if (strainInput3) strainInput3.value = '';
                    const f = document.getElementById('strain-file3');
                    if (f) f.value = '';
                    if (retrieveBtn3) retrieveBtn3.disabled = true;
                } else if (formId === 'common-test-form') {
                    if (strainInput4) strainInput4.value = '';
                    const f = document.getElementById('strain-file4');
                    if (f) f.value = '';
                    if (retrieveBtn4) retrieveBtn4.disabled = true;
                }
            });
        });

        // ==========================================
        // Quick Navigation Jumps
        // ==========================================
        ['goto-1', 'goto-2', 'goto-3', 'goto-4'].forEach(id => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const targetMap = {
                    'goto-1': 'general-phenotype-search',
                    'goto-2': 'strain-search',
                    'goto-3': 'specific-strain-phenotype-search',
                    'goto-4': 'common-test-tool'
                };
                const targetEl = document.getElementById(targetMap[id]);
                if (targetEl) {
                    scrollToElement(targetEl);
                }
            });
        });

        // Smooth scrolling for results table navigation chips and jump links
        document.addEventListener('click', function (e) {
            const jumpLink = e.target.closest('.nust-table-chip, .nust-back-to-top');
            if (jumpLink) {
                const href = jumpLink.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const targetEl = document.querySelector(href);
                    if (targetEl) {
                        e.preventDefault();
                        scrollToElement(targetEl);
                        if (window.history && window.history.pushState) {
                            window.history.pushState(null, null, href);
                        }
                    }
                }
            }
        });

        // ==========================================
        // Search Form Submission Handlers
        // ==========================================

        // 1. General Phenotype Form Submit
        const form1 = document.getElementById('general-phenotype-form');
        if (form1) {
            form1.addEventListener('submit', async function (e) {
                e.preventDefault();
                const years = Array.from(yearSelect1.selectedOptions).map(o => parseInt(o.value)).filter(v => !isNaN(v));
                const tests = Array.from(testSelect1.selectedOptions).map(o => o.value);
                const locations = Array.from(locationSelect1.selectedOptions).map(o => o.value);
                const strains = Array.from(strainSelect1.selectedOptions).map(o => o.value);
                const phenotypes = Array.from(phenotypeSelect1.selectedOptions).map(o => o.value);

                showResultsLoader('Retrieving phenotypic observations, checks, and trial statistics...', 'general-phenotype-search', 'Querying Phenotype Data');
                try {
                    const payload = {
                        years,
                        tests,
                        locations,
                        strains,
                        phenotypes,
                        searchType: 'general'
                    };
                    const res = await apiRequest('/search/phenotype', 'POST', payload);
                    currentPhenotypeParams = payload;
                    currentPhenotypeResults = res.results;
                    renderPhenotypeResults(res.title || 'General Phenotype Results', res.results, payload);
                } catch (err) {
                    showAlert(`Phenotype query failed: ${err.message}`);
                    if (resultsContainer) resultsContainer.setAttribute('hidden', 'hidden');
                    if (searchInterface) searchInterface.removeAttribute('hidden');
                    const returnEl = document.getElementById('general-phenotype-search') || document.getElementById('nust-header');
                    if (returnEl) scrollToElement(returnEl);
                } finally {
                    hideResultsLoader();
                }
            });
        }

        // 2. Strain Search Form Submit
        const form2 = document.getElementById('strain-search-form');
        if (form2) {
            form2.addEventListener('submit', async function (e) {
                e.preventDefault();
                const strains = strainInput2.value.split('\n').map(s => s.trim()).filter(Boolean);
                if (!strains.length) {
                    showAlert('Please enter at least one strain name.', 'warning');
                    return;
                }

                showResultsLoader('Matching strain designations across historical uniform trials...', 'strain-search', 'Searching Strains');
                try {
                    const res = await apiRequest('/search/strain', 'POST', { strains });
                    renderStrainResults(res.results || [], strains);
                } catch (err) {
                    showAlert(`Strain query failed: ${err.message}`);
                    if (resultsContainer) resultsContainer.setAttribute('hidden', 'hidden');
                    if (searchInterface) searchInterface.removeAttribute('hidden');
                    const returnEl = document.getElementById('strain-search') || document.getElementById('nust-header');
                    if (returnEl) scrollToElement(returnEl);
                } finally {
                    hideResultsLoader();
                }
            });
        }

        // 3. Specific Strain Phenotype Form Submit
        const form3 = document.getElementById('specific-strain-phenotype-form');
        if (form3) {
            form3.addEventListener('submit', async function (e) {
                e.preventDefault();
                const years = Array.from(yearSelect3.selectedOptions).map(o => parseInt(o.value)).filter(v => !isNaN(v));
                const tests = Array.from(testSelect3.selectedOptions).map(o => o.value);
                const locations = Array.from(locationSelect3.selectedOptions).map(o => o.value);
                const phenotypes = Array.from(phenotypeSelect3.selectedOptions).map(o => o.value);
                const strains = strainInput3.value.split('\n').map(s => s.trim()).filter(Boolean);

                if (!strains.length) {
                    showAlert('Please enter at least one strain name.', 'warning');
                    return;
                }

                showResultsLoader('Retrieving observations for designated strains and trial filters...', 'specific-strain-phenotype-search', 'Querying Strain Phenotypes');
                try {
                    const payload = {
                        years,
                        tests,
                        locations,
                        strains,
                        phenotypes,
                        searchType: 'specific'
                    };
                    const res = await apiRequest('/search/phenotype', 'POST', payload);
                    currentPhenotypeParams = payload;
                    currentPhenotypeResults = res.results;
                    renderPhenotypeResults(res.title || 'Specific Strain Phenotype Results', res.results, payload);
                } catch (err) {
                    showAlert(`Specific phenotype query failed: ${err.message}`);
                    if (resultsContainer) resultsContainer.setAttribute('hidden', 'hidden');
                    if (searchInterface) searchInterface.removeAttribute('hidden');
                    const returnEl = document.getElementById('specific-strain-phenotype-search') || document.getElementById('nust-header');
                    if (returnEl) scrollToElement(returnEl);
                } finally {
                    hideResultsLoader();
                }
            });
        }

        // 4. Common Test Form Submit
        const form4 = document.getElementById('common-test-form');
        if (form4) {
            form4.addEventListener('submit', async function (e) {
                e.preventDefault();
                const strains = strainInput4.value.split('\n').map(s => s.trim()).filter(Boolean);
                if (!strains.length) {
                    showAlert('Please enter at least one strain name.', 'warning');
                    return;
                }

                showResultsLoader('Cross-referencing trial years and tests common to all queried strains...', 'common-test-tool', 'Finding Common Tests');
                try {
                    const res = await apiRequest('/search/common', 'POST', { strains });
                    renderCommonResults(res.results || [], strains);
                } catch (err) {
                    showAlert(`Common test query failed: ${err.message}`);
                    if (resultsContainer) resultsContainer.setAttribute('hidden', 'hidden');
                    if (searchInterface) searchInterface.removeAttribute('hidden');
                    const returnEl = document.getElementById('common-test-tool') || document.getElementById('nust-header');
                    if (returnEl) scrollToElement(returnEl);
                } finally {
                    hideResultsLoader();
                }
            });
        }
    });

    // ==========================================
    // Results Rendering: Phenotype (General & Specific)
    // ==========================================
    function renderPhenotypeResults(title, results, params) {
        destroyDataTables();
        const container = document.getElementById('results-content');
        if (!container) return;

        const hasChecks = results && results.checks && results.checks.length > 0;
        const hasPhenotypes = results && results.phenotypes && results.phenotypes.length > 0;
        const hasReps = results && results.replicates && results.replicates.length > 0;
        const hasLocations = results && results.locations && results.locations.length > 0;
        const hasStrains = results && results.strains && results.strains.length > 0;

        const totalRecords = (results?.checks?.length || 0) +
            (results?.phenotypes?.length || 0) +
            (results?.replicates?.length || 0) +
            (results?.locations?.length || 0) +
            (results?.strains?.length || 0);

        if (totalRecords === 0) {
            hideResultsLoader();
            container.innerHTML = `
                <div class="uk-card uk-card-default uk-card-body uk-margin-top">
                    <div class="nust-results-header uk-flex uk-flex-between uk-flex-wrap uk-flex-middle">
                        <h2 class="uk-card-title uk-margin-remove-bottom">${title}</h2>
                        <button class="uk-button uk-button-primary" onclick="window.nustBackToSearch()">
                            <span uk-icon="icon: arrow-left; ratio: 0.9"></span> Modify Search
                        </button>
                    </div>
                    <div class="uk-alert uk-alert-warning">
                        <p><strong>No records found.</strong> Please adjust your filter criteria and try again.</p>
                    </div>
                </div>
            `;
            return;
        }

        let html = `
            <div class="uk-card uk-card-default uk-card-body uk-margin-top">
                <div class="nust-results-header uk-flex uk-flex-between uk-flex-wrap uk-flex-middle">
                    <div class="uk-margin-small-bottom">
                        <h2 class="uk-card-title uk-margin-remove-bottom">${title}</h2>
                        <div class="uk-text-meta uk-margin-xsmall-top">
                            <strong>Years:</strong> ${params.years.join(', ')} &nbsp;|&nbsp; <strong>Tests:</strong> ${params.tests.join(', ')} &nbsp;|&nbsp; <strong>Total Records:</strong> ${totalRecords}
                        </div>
                    </div>
                    <div class="uk-margin-small-bottom">
                        <button class="uk-button uk-button-primary" onclick="window.nustBackToSearch()">
                            <span uk-icon="icon: arrow-left; ratio: 0.9"></span> Modify Search
                        </button>
                    </div>
                </div>

                <div class="nust-results-toolbar" id="results-toolbar">
                    <div class="uk-grid uk-grid-medium uk-flex-middle" uk-grid>
                        <!-- Export Actions -->
                        <div class="uk-width-auto@m">
                            <span class="nust-toolbar-label"><span uk-icon="icon: download; ratio: 0.85"></span> Export Data</span>
                            <div class="uk-flex uk-flex-wrap uk-gap-small">
                                <div class="uk-inline">
                                    <button class="uk-button nust-export-btn" type="button">
                                        Download CSV <span uk-icon="icon: chevron-down; ratio: 0.8"></span>
                                    </button>
                                    <div uk-dropdown="mode: click">
                                        <ul class="uk-nav uk-dropdown-nav">
                                            <li><a href="#" class="nust-dl-btn" data-fmt="csv" data-tbl="all">All Tables (Merged)</a></li>
                                            ${hasChecks ? '<li><a href="#" class="nust-dl-btn" data-fmt="csv" data-tbl="checks">Checks</a></li>' : ''}
                                            ${hasPhenotypes ? '<li><a href="#" class="nust-dl-btn" data-fmt="csv" data-tbl="phenotypes">Phenotypes</a></li>' : ''}
                                            ${hasReps ? '<li><a href="#" class="nust-dl-btn" data-fmt="csv" data-tbl="replicates">Replicates</a></li>' : ''}
                                            ${hasLocations ? '<li><a href="#" class="nust-dl-btn" data-fmt="csv" data-tbl="locations">Locations</a></li>' : ''}
                                            ${hasStrains ? '<li><a href="#" class="nust-dl-btn" data-fmt="csv" data-tbl="strains">Strains</a></li>' : ''}
                                        </ul>
                                    </div>
                                </div>
                                <div class="uk-inline">
                                    <button class="uk-button nust-export-btn" type="button">
                                        Download TXT <span uk-icon="icon: chevron-down; ratio: 0.8"></span>
                                    </button>
                                    <div uk-dropdown="mode: click">
                                        <ul class="uk-nav uk-dropdown-nav">
                                            <li><a href="#" class="nust-dl-btn" data-fmt="txt" data-tbl="all">All Tables (Merged)</a></li>
                                            ${hasChecks ? '<li><a href="#" class="nust-dl-btn" data-fmt="txt" data-tbl="checks">Checks</a></li>' : ''}
                                            ${hasPhenotypes ? '<li><a href="#" class="nust-dl-btn" data-fmt="txt" data-tbl="phenotypes">Phenotypes</a></li>' : ''}
                                            ${hasReps ? '<li><a href="#" class="nust-dl-btn" data-fmt="txt" data-tbl="replicates">Replicates</a></li>' : ''}
                                            ${hasLocations ? '<li><a href="#" class="nust-dl-btn" data-fmt="txt" data-tbl="locations">Locations</a></li>' : ''}
                                            ${hasStrains ? '<li><a href="#" class="nust-dl-btn" data-fmt="txt" data-tbl="strains">Strains</a></li>' : ''}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Table Navigation -->
                        <div class="uk-width-expand@m">
                            <span class="nust-toolbar-label"><span uk-icon="icon: list; ratio: 0.85"></span> Jump To Table</span>
                            <div class="uk-flex uk-flex-wrap uk-gap-small">
                                ${hasChecks ? `<a href="#table-checks" class="nust-table-chip" uk-scroll="offset: 110">Checks <span class="nust-table-count">${results.checks.length}</span></a>` : ''}
                                ${hasPhenotypes ? `<a href="#table-phenotypes" class="nust-table-chip" uk-scroll="offset: 110">Phenotypes <span class="nust-table-count">${results.phenotypes.length}</span></a>` : ''}
                                ${hasReps ? `<a href="#table-replicates" class="nust-table-chip" uk-scroll="offset: 110">Replicates <span class="nust-table-count">${results.replicates.length}</span></a>` : ''}
                                ${hasLocations ? `<a href="#table-locations" class="nust-table-chip" uk-scroll="offset: 110">Locations <span class="nust-table-count">${results.locations.length}</span></a>` : ''}
                                ${hasStrains ? `<a href="#table-strains" class="nust-table-chip" uk-scroll="offset: 110">Strains <span class="nust-table-count">${results.strains.length}</span></a>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
        `;

        // 1. Checks Table
        if (hasChecks) {
            html += `
                <div id="table-checks" class="uk-margin-large-top">
                    <div class="uk-flex uk-flex-between uk-flex-middle">
                        <h3>Check Strains (${results.checks.length})</h3>
                        <div class="uk-flex uk-flex-middle uk-gap-small">
                            <a href="#results-toolbar" class="uk-button uk-button-text uk-margin-small-right" uk-scroll="offset: 110"><span uk-icon="icon: arrow-up; ratio: 0.75"></span> Top</a>
                            <button class="uk-button nust-export-btn" onclick="window.nustExportTable('checks-table', 'check_strains.csv')"><span uk-icon="icon: download; ratio: 0.8"></span> Export CSV</button>
                        </div>
                    </div>
                    <div class="uk-overflow-auto">
                        <table id="checks-table" class="uk-table uk-table-striped uk-table-hover uk-table-small uk-width-1-1">
                            <thead>
                                <tr><th>Year</th><th>Test</th><th>Strain</th><th>Phenotype</th></tr>
                            </thead>
                            <tbody>
                                ${results.checks.map(r => `<tr><td>${r.year}</td><td>${r.test}</td><td>${r.strain}</td><td>${r.phenotype}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // 2. Phenotypes Table
        if (hasPhenotypes) {
            html += `
                <div id="table-phenotypes" class="uk-margin-large-top">
                    <div class="uk-flex uk-flex-between uk-flex-middle">
                        <h3>Phenotype Location Means (${results.phenotypes.length})</h3>
                        <div class="uk-flex uk-flex-middle uk-gap-small">
                            <a href="#results-toolbar" class="uk-button uk-button-text uk-margin-small-right" uk-scroll="offset: 110"><span uk-icon="icon: arrow-up; ratio: 0.75"></span> Top</a>
                            <button class="uk-button nust-export-btn" onclick="window.nustExportTable('phenotypes-table', 'phenotypes.csv')"><span uk-icon="icon: download; ratio: 0.8"></span> Export CSV</button>
                        </div>
                    </div>
                    <div class="uk-overflow-auto">
                        <table id="phenotypes-table" class="uk-table uk-table-striped uk-table-hover uk-table-small uk-width-1-1">
                            <thead>
                                <tr><th>Year</th><th>Test</th><th>Location</th><th>Strain</th><th>Phenotype</th><th>Value</th></tr>
                            </thead>
                            <tbody>
                                ${results.phenotypes.map(r => `<tr><td>${r.year}</td><td>${r.test}</td><td>${r.location}</td><td>${r.strain}</td><td>${r.phenotype}</td><td>${r.value}${r.unit || ''}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // 3. Replicates Table
        if (hasReps) {
            html += `
                <div id="table-replicates" class="uk-margin-large-top">
                    <div class="uk-flex uk-flex-between uk-flex-middle">
                        <div>
                            <h3 class="uk-margin-remove-bottom">Replicates (${results.replicates.length})</h3>
                            <span class="uk-text-meta uk-text-italic">Note: Not all years had replicate values</span>
                        </div>
                        <div class="uk-flex uk-flex-middle uk-gap-small">
                            <a href="#results-toolbar" class="uk-button uk-button-text uk-margin-small-right" uk-scroll="offset: 110"><span uk-icon="icon: arrow-up; ratio: 0.75"></span> Top</a>
                            <button class="uk-button nust-export-btn" onclick="window.nustExportTable('replicates-table', 'replicates.csv')"><span uk-icon="icon: download; ratio: 0.8"></span> Export CSV</button>
                        </div>
                    </div>
                    <div class="uk-overflow-auto uk-margin-small-top">
                        <table id="replicates-table" class="uk-table uk-table-striped uk-table-hover uk-table-small uk-width-1-1">
                            <thead>
                                <tr><th>Year</th><th>Test</th><th>Location</th><th>Strain</th><th>Rep #</th><th>Phenotype</th><th>Value</th></tr>
                            </thead>
                            <tbody>
                                ${results.replicates.map(r => `<tr><td>${r.year}</td><td>${r.test}</td><td>${r.location}</td><td>${r.strain}</td><td>${r.repnum}</td><td>${r.phenotype}</td><td>${r.value}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // 4. Locations Table
        if (hasLocations) {
            html += `
                <div id="table-locations" class="uk-margin-large-top">
                    <div class="uk-flex uk-flex-between uk-flex-middle">
                        <h3>Locations (${results.locations.length})</h3>
                        <div class="uk-flex uk-flex-middle uk-gap-small">
                            <a href="#results-toolbar" class="uk-button uk-button-text uk-margin-small-right" uk-scroll="offset: 110"><span uk-icon="icon: arrow-up; ratio: 0.75"></span> Top</a>
                            <button class="uk-button nust-export-btn" onclick="window.nustExportTable('locations-table', 'locations.csv')"><span uk-icon="icon: download; ratio: 0.8"></span> Export CSV</button>
                        </div>
                    </div>
                    <div class="uk-overflow-auto">
                        <table id="locations-table" class="uk-table uk-table-striped uk-table-hover uk-table-small uk-width-1-1">
                            <thead>
                                <tr>
                                    <th>Year</th><th>Test</th><th>Location</th><th>Lat</th><th>Long</th>
                                    <th>Conductor</th><th>Planting Date</th><th>Row Spacing</th>
                                    <th>Maturity Date</th><th>Days to Maturity</th><th>Comment</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${results.locations.map(r => `
                                    <tr>
                                        <td>${r.year}</td><td>${r.test}</td><td>${r.location}</td>
                                        <td>${r.lat || ''}</td><td>${r.longe || ''}</td><td>${r.conductor || ''}</td>
                                        <td>${r.planting_date || ''}</td><td>${r.row_spacing || ''}</td>
                                        <td>${r.maturity_date || ''}</td><td>${r.days_to_maturity || ''}</td>
                                        <td>${r.comment || ''}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // 5. Strains Table
        if (hasStrains) {
            html += `
                <div id="table-strains" class="uk-margin-large-top">
                    <div class="uk-flex uk-flex-between uk-flex-middle">
                        <h3>Strains (${results.strains.length})</h3>
                        <div class="uk-flex uk-flex-middle uk-gap-small">
                            <a href="#results-toolbar" class="uk-button uk-button-text uk-margin-small-right" uk-scroll="offset: 110"><span uk-icon="icon: arrow-up; ratio: 0.75"></span> Top</a>
                            <button class="uk-button nust-export-btn" onclick="window.nustExportTable('strains-table', 'strains.csv')"><span uk-icon="icon: download; ratio: 0.8"></span> Export CSV</button>
                        </div>
                    </div>
                    <div class="uk-overflow-auto">
                        <table id="strains-table" class="uk-table uk-table-striped uk-table-hover uk-table-small uk-width-1-1">
                            <thead>
                                <tr><th>Year</th><th>Test</th><th>Strain</th><th>Descriptive Code</th><th>Unique Traits</th><th>Gen. Comp.</th></tr>
                            </thead>
                            <tbody>
                                ${results.strains.map(r => `<tr><td>${r.year}</td><td>${r.test}</td><td>${r.strain}</td><td>${r.descriptive_code || ''}</td><td>${r.unique_traits || ''}</td><td>${r.gen_comp || ''}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        html += `
                <div class="uk-text-center uk-margin-large-top">
                    <button class="uk-button uk-button-primary" onclick="window.nustBackToSearch()">
                        <span uk-icon="icon: arrow-left"></span> Back to Search Tools
                    </button>
                </div>
            </div>
        `;

        hideResultsLoader();
        container.innerHTML = html;

        // Initialize DataTables
        const tableIds = ['#checks-table', '#phenotypes-table', '#replicates-table', '#locations-table', '#strains-table'];
        tableIds.forEach(id => {
            if ($(id).length) {
                const dt = $(id).DataTable({
                    pageLength: 25,
                    lengthMenu: [10, 25, 50, 100],
                    responsive: true
                });
                activeDataTables.push(id);
            }
        });

        // Wire download triggers
        container.querySelectorAll('.nust-dl-btn').forEach(a => {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                const format = this.getAttribute('data-fmt');
                const table = this.getAttribute('data-tbl');
                downloadPhenotypeData(format, table);
            });
        });
    }

    // ==========================================
    // Results Rendering: Strain Search
    // ==========================================
    function renderStrainResults(results, searchedStrains) {
        destroyDataTables();
        hideResultsLoader();
        const container = document.getElementById('results-content');
        if (!container) return;

        let html = `
            <div class="uk-card uk-card-default uk-card-body uk-margin-top">
                <div class="nust-results-header uk-flex uk-flex-between uk-flex-wrap uk-flex-middle">
                    <div class="uk-margin-small-bottom">
                        <h2 class="uk-card-title uk-margin-remove-bottom">Strain Search Results</h2>
                        <div class="uk-text-meta uk-margin-xsmall-top">
                            <strong>Query:</strong> ${searchedStrains.join(', ')} &nbsp;|&nbsp; <strong>Total Records:</strong> ${results.length}
                        </div>
                    </div>
                    <div class="uk-margin-small-bottom">
                        <button class="uk-button uk-button-primary" onclick="window.nustBackToSearch()">
                            <span uk-icon="icon: arrow-left; ratio: 0.9"></span> Modify Search
                        </button>
                    </div>
                </div>
        `;

        if (!results.length) {
            html += `
                <div class="uk-alert uk-alert-primary">
                    <p>No trial records found for the strain designation(s) entered.</p>
                </div>
            `;
        } else {
            html += `
                <div class="uk-margin-medium-top">
                    <div class="uk-flex uk-flex-between uk-flex-middle uk-margin-small-bottom">
                        <h3 class="uk-margin-remove-bottom">Evaluation Records (${results.length})</h3>
                        <button class="uk-button nust-export-btn" onclick="window.nustExportTable('strain-results-table', 'strain_search_results.csv')">
                            <span uk-icon="icon: download; ratio: 0.8"></span> Export CSV
                        </button>
                    </div>
                    <div class="uk-overflow-auto">
                        <table id="strain-results-table" class="uk-table uk-table-striped uk-table-hover uk-table-small uk-width-1-1">
                            <thead>
                                <tr><th>Strain</th><th>Year</th><th>Test</th></tr>
                            </thead>
                            <tbody>
                                ${results.map(r => `<tr><td><strong>${r.strain}</strong></td><td>${r.year}</td><td>${r.test}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        html += `
                <div class="uk-text-center uk-margin-large-top">
                    <button class="uk-button uk-button-primary" onclick="window.nustBackToSearch()">
                        <span uk-icon="icon: arrow-left"></span> Back to Search Tools
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;

        if (results.length) {
            $('#strain-results-table').DataTable({
                pageLength: 25,
                lengthMenu: [10, 25, 50, 100],
                responsive: true
            });
            activeDataTables.push('#strain-results-table');
        }
    }

    // ==========================================
    // Results Rendering: Common Tests
    // ==========================================
    function renderCommonResults(results, searchedStrains) {
        destroyDataTables();
        hideResultsLoader();
        const container = document.getElementById('results-content');
        if (!container) return;

        let html = `
            <div class="uk-card uk-card-default uk-card-body uk-margin-top">
                <div class="nust-results-header uk-flex uk-flex-between uk-flex-wrap uk-flex-middle">
                    <div class="uk-margin-small-bottom">
                        <h2 class="uk-card-title uk-margin-remove-bottom">Common Tests Across Strains</h2>
                        <div class="uk-text-meta uk-margin-xsmall-top">
                            <strong>Strains Queried:</strong> ${searchedStrains.join(', ')} &nbsp;|&nbsp; <strong>Common Trials:</strong> ${results.length}
                        </div>
                    </div>
                    <div class="uk-margin-small-bottom">
                        <button class="uk-button uk-button-primary" onclick="window.nustBackToSearch()">
                            <span uk-icon="icon: arrow-left; ratio: 0.9"></span> Modify Search
                        </button>
                    </div>
                </div>
        `;

        if (!results.length) {
            html += `
                <div class="uk-alert uk-alert-primary">
                    <p>No common years and tests were found in which all entered strains were simultaneously evaluated.</p>
                </div>
            `;
        } else {
            html += `
                <div class="uk-margin-medium-top">
                    <div class="uk-flex uk-flex-between uk-flex-middle uk-margin-small-bottom">
                        <h3 class="uk-margin-remove-bottom">Matching Trial Tests (${results.length})</h3>
                        <button class="uk-button nust-export-btn" onclick="window.nustExportTable('common-results-table', 'common_tests.csv')">
                            <span uk-icon="icon: download; ratio: 0.8"></span> Export CSV
                        </button>
                    </div>
                    <div class="uk-overflow-auto">
                        <table id="common-results-table" class="uk-table uk-table-striped uk-table-hover uk-table-small uk-width-1-1">
                            <thead>
                                <tr><th>Year</th><th>Test</th></tr>
                            </thead>
                            <tbody>
                                ${results.map(r => `<tr><td>${r.year}</td><td>${r.test}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        html += `
                <div class="uk-text-center uk-margin-large-top">
                    <button class="uk-button uk-button-primary" onclick="window.nustBackToSearch()">
                        <span uk-icon="icon: arrow-left"></span> Back to Search Tools
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;

        if (results.length) {
            $('#common-results-table').DataTable({
                pageLength: 25,
                lengthMenu: [10, 25, 50, 100],
                responsive: true
            });
            activeDataTables.push('#common-results-table');
        }
    }

    // ==========================================
    // Export and Download Utilities
    // ==========================================
    async function downloadPhenotypeData(format, table) {
        if (!currentPhenotypeParams) {
            showAlert('No active phenotype search query parameters available.', 'warning');
            return;
        }

        try {
            // Attempt API download endpoint
            const formBody = new URLSearchParams();
            formBody.append('download', format);
            formBody.append('table', table);
            formBody.append('years', currentPhenotypeParams.years.join(','));
            formBody.append('tests', currentPhenotypeParams.tests.join(','));
            formBody.append('locations', currentPhenotypeParams.locations.join(','));
            formBody.append('strains', currentPhenotypeParams.strains.join(','));
            formBody.append('phenotypes', currentPhenotypeParams.phenotypes.join(','));

            const response = await fetch(`${API_BASE}/download/general-phenotype`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formBody.toString()
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `nust_${table}.${format}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                return;
            }
            throw new Error(`API download returned ${response.status}`);
        } catch (err) {
            console.warn('API download endpoint failed, generating client-side export:', err);
            exportClientSidePhenotype(format, table);
        }
    }

    function exportClientSidePhenotype(format, table) {
        if (!currentPhenotypeResults) return;
        const separator = format === 'csv' ? ',' : '\t';
        const ext = format === 'csv' ? 'csv' : 'txt';

        function escapeVal(v) {
            if (v == null) return '';
            let s = String(v);
            if (format === 'csv' && (s.includes(',') || s.includes('"') || s.includes('\n'))) {
                s = `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        }

        function toRows(items, headers) {
            const out = [headers.join(separator)];
            items.forEach(item => {
                out.push(headers.map(h => escapeVal(item[h.toLowerCase().replace(/[^a-z0-9]/g, '_')] || item[h] || '')).join(separator));
            });
            return out.join('\n');
        }

        let content = '';
        if (table === 'all') {
            const sections = [];
            if (currentPhenotypeResults.checks) {
                sections.push('Checks:\n' + toRows(currentPhenotypeResults.checks, ['year', 'test', 'strain', 'phenotype']));
            }
            if (currentPhenotypeResults.phenotypes) {
                sections.push('Phenotypes:\n' + toRows(currentPhenotypeResults.phenotypes, ['year', 'test', 'location', 'strain', 'phenotype', 'value', 'unit']));
            }
            if (currentPhenotypeResults.replicates) {
                sections.push('Replicates:\n' + toRows(currentPhenotypeResults.replicates, ['year', 'test', 'location', 'strain', 'repnum', 'phenotype', 'value']));
            }
            if (currentPhenotypeResults.locations) {
                sections.push('Locations:\n' + toRows(currentPhenotypeResults.locations, ['year', 'test', 'location', 'lat', 'longe', 'conductor', 'planting_date', 'row_spacing', 'maturity_date', 'days_to_maturity', 'comment']));
            }
            if (currentPhenotypeResults.strains) {
                sections.push('Strains:\n' + toRows(currentPhenotypeResults.strains, ['year', 'test', 'strain', 'descriptive_code', 'unique_traits', 'gen_comp']));
            }
            content = sections.join('\n\n');
        } else if (currentPhenotypeResults[table]) {
            const cols = Object.keys(currentPhenotypeResults[table][0] || {});
            content = toRows(currentPhenotypeResults[table], cols);
        }

        const blob = new Blob([content], { type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nust_${table}.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    }

    // Global helper to export any HTML table to CSV
    window.nustExportTable = function (tableId, filename = 'export.csv') {
        const table = document.getElementById(tableId);
        if (!table) return;

        const rows = [];
        // Header
        const ths = table.querySelectorAll('thead th');
        if (ths.length) {
            rows.push(Array.from(ths).map(th => `"${th.textContent.trim().replace(/"/g, '""')}"`).join(','));
        }

        // Body rows (extract from full DataTable data if initialized)
        if ($.fn.DataTable.isDataTable('#' + tableId)) {
            const dt = $('#' + tableId).DataTable();
            dt.data().each(row => {
                const cleanRow = row.map(cell => {
                    const text = $('<div>').html(cell).text().trim();
                    return `"${text.replace(/"/g, '""')}"`;
                });
                rows.push(cleanRow.join(','));
            });
        } else {
            table.querySelectorAll('tbody tr').forEach(tr => {
                const row = Array.from(tr.querySelectorAll('td')).map(td => `"${td.textContent.trim().replace(/"/g, '""')}"`);
                rows.push(row.join(','));
            });
        }

        const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    // Global helper: Back to search forms
    window.nustBackToSearch = function () {
        const searchInterface = document.getElementById('nust-search-interface');
        const resultsContainer = document.getElementById('results-container');
        if (resultsContainer) resultsContainer.setAttribute('hidden', 'hidden');
        if (searchInterface) searchInterface.removeAttribute('hidden');

        const targetEl = (lastActiveToolId && document.getElementById(lastActiveToolId)) || document.getElementById('nust-main-nav') || document.getElementById('nust-header');
        if (targetEl) {
            scrollToElement(targetEl);
        }
    };

})();
