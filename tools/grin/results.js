// Import necessary libraries
const { MongoClient } = require('mongodb');

// Configuration
const uri = 'mongodb://localhost:27017'; // MongoDB connection URI
const dbName = 'soybase';
const client = new MongoClient(uri);

(async () => {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);

        // Step 1: Get distinct cultivars
        const distinctCultivars = await db
            .collection('germplasm_grin_descriptor_data')
            .distinct('cultivar_name');

        // Step 2: Process requested cultivars
        let requestedCultivarsRaw = ''; // Replace with input from the request
        let requestedCultivars = requestedCultivarsRaw
            .split('\n')
            .map(cultivar => cultivar.trim())
            .filter(cultivar => cultivar !== '');

        let requestedCultivarsString = requestedCultivars
            .map(cultivar => `'${cultivar}'`)
            .join(',');

        // Step 3: Check for alternate cultivar names
        if (requestedCultivars.length > 0) {
            const alternateNames = await db
                .collection('germplasm_grin_othernames')
                .find({ alternate_name: { $in: requestedCultivars } })
                .toArray();

            if (alternateNames.length > 0) {
                alternateNames.forEach(alternate => {
                    const index = requestedCultivars.indexOf(alternate.alternate_name);
                    if (index !== -1) {
                        requestedCultivars[index] = alternate.grin_name;
                    }
                });

                requestedCultivarsString = requestedCultivars
                    .map(cultivar => `'${cultivar}'`)
                    .join(',');
            }
        }

        // Step 4: Find missing cultivars
        const missingCultivars = requestedCultivars.filter(
            cultivar => !distinctCultivars.includes(cultivar)
        );

        requestedCultivars = requestedCultivars.filter(
            cultivar => !missingCultivars.includes(cultivar)
        );

        // Step 5: Get request specifics
        const categories = [
            'Disease',
            'Insect',
            'Nematode',
            'Stress',
            'Morphology',
            'Growth',
            'Root',
            'Phenology',
            'Chemical',
            'Production',
            'User Submitted'
        ];

        const requestSpecifics = await db
            .collection('germplasm_grin_descriptor_definitions')
            .find()
            .toArray();

        // Mock user input for selected descriptors
        requestSpecifics.forEach(specific => {
            specific.selected = 'no'; // Replace with actual user input logic
        });

        const chosenDescriptors = requestSpecifics
            .filter(specific => specific.selected === 'yes')
            .map(specific => specific.descriptor_shortname);

        const relevantDescriptorsList = chosenDescriptors
            .map(descriptor => `'${descriptor}'`)
            .join(',');

        // Step 6: Get distinct cultivars matching criteria
        const distinctCultivarResults = await db
            .collection('germplasm_grin_descriptor_data')
            .aggregate([
                { $match: { cultivar_name: { $in: requestedCultivars } } },
                { $group: { _id: { cultivar_name: '$cultivar_name', grin_acc_id: '$grin_acc_id' } } }
            ])
            .toArray();

        // Map results to key-value format
        const maximumResults = {};
        distinctCultivarResults.forEach(result => {
            const key = `${result._id.cultivar_name}_${result._id.grin_acc_id}`;
            maximumResults[key] = {
                cultivar_name: result._id.cultivar_name,
                grin_acc_id: result._id.grin_acc_id
            };
        });

        // Step 7: Fetch descriptor values
        const descriptorValues = await db
            .collection('germplasm_grin_descriptor_data')
            .find({
                descriptor_shortname: { $in: chosenDescriptors },
                cultivar_name: { $in: requestedCultivars }
            })
            .toArray();

        // Populate maximumResults with descriptor values
        descriptorValues.forEach(value => {
            const key = `${value.cultivar_name}_${value.grin_acc_id}`;
            if (maximumResults[key]) {
                maximumResults[key][value.descriptor_shortname] = value.descriptor_value;
            }
        });

        console.log('Final Results:', maximumResults);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
})();


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="../../include/sb_styles.css">
    <link rel="stylesheet" type="text/css" href="styles.css">
    <script type="text/javascript" src="scripts.js"></script>
    <title>GRIN Data Explorer - Results</title>
</head>
<body id="bdyBody">
    <div class="sb_middle2">
        <div class="sb_main2">
            <div id="divGrin">
                <div id="divMainFormContainer">
                    <form action="results_download.php" method="post" id="frmGrin" name="frmGrin">
                        <input type="hidden" name="inpCultivarsRadio" id="inpCultivarsRadio" value="">
                        <input type="hidden" name="tareaCultivarsList" id="tareaCultivarsList" value="">

                        <script>
                            // Dynamic content rendering based on JavaScript data
                            const arrRequestSpecifics = [
                                // Example of request specifics data
                                { descriptor_category: 'category1', selected: 'yes', id: 1, descriptor_distincts: '', selected_option: 'Option1', selected_min: 10, selected_max: 20 },
                                { descriptor_category: 'category2', selected: 'no', id: 2, descriptor_distincts: '', selected_option: '', selected_min: '', selected_max: '' }
                            ];

                            arrRequestSpecifics.forEach((item) => {
                                if (item.selected === 'yes') {
                                    const hiddenInput = document.createElement('input');
                                    hiddenInput.type = 'hidden';
                                    hiddenInput.name = `inpDescriptorCheckbox_${item.descriptor_category}_${item.id}`;
                                    hiddenInput.value = 'yes';
                                    document.getElementById('frmGrin').appendChild(hiddenInput);

                                    if (item.descriptor_distincts) {
                                        const optionInput = document.createElement('input');
                                        optionInput.type = 'hidden';
                                        optionInput.name = `selDescriptorValue_${item.id}`;
                                        optionInput.value = item.selected_option;
                                        document.getElementById('frmGrin').appendChild(optionInput);
                                    } else {
                                        const minInput = document.createElement('input');
                                        minInput.type = 'hidden';
                                        minInput.name = `inpDescriptorValueMin_${item.id}`;
                                        minInput.value = item.selected_min;
                                        document.getElementById('frmGrin').appendChild(minInput);

                                        const maxInput = document.createElement('input');
                                        maxInput.type = 'hidden';
                                        maxInput.name = `inpDescriptorValueMax_${item.id}`;
                                        maxInput.value = item.selected_max;
                                        document.getElementById('frmGrin').appendChild(maxInput);
                                    }
                                }
                            });
                        </script>

                        <div id="divTitleText" class="top_bar">
                            GRIN Data Explorer - Results
                        </div>

                        <div id="divHelpContainer">
                            <script>
                                const resultsFound = 10; // Replace with actual results count
                                const missingCultivars = '';

                                if (resultsFound === 0) {
                                    document.write("<p class='clsHelpText'>Sorry, we could not find any results that match your request. Please, <a href='javascript:window.history.back();'>go back</a> and try a different search.</p>");
                                } else {
                                    document.write(`<p class='clsHelpText'>We found <strong>${resultsFound}</strong> result(s) that match your request.</p>`);

                                    if (missingCultivars) {
                                        document.write(`<p class='clsHelpText'>Sorry, the following cultivars you submitted were not found in our database: ${missingCultivars}</p>`);
                                    }

                                    document.write(`<p class='clsHelpText'>Please note, some traits may contain multiple values.</p>`);
                                    document.write(`<div id='divTopButtonsContainer'><button id='btnTopSubmitMainForm' class='clsButton' type='submit'>Download All Results</button></div>`);

                                    // Generate the results table dynamically
                                    const table = `<table id='tblGRINResults'>
                                        <thead>
                                            <tr>
                                                <th>GRIN Accession</th>
                                                <th>Descriptor</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${Array(resultsFound).fill().map((_, i) => `<tr><td>Accession ${i + 1}</td><td>Descriptor ${i + 1}</td><td>Value ${i + 1}</td></tr>`).join('')}
                                        </tbody>
                                    </table>`;

                                    document.write(table);
                                    document.write(`<div id='divMainButtonsContainer'><button id='btnSubmitMainForm' class='clsButton' type='submit'>Download All Results</button></div>`);
                                }
                            </script>
                        </div>
                    </form>
                </div>
            </div>

            <div class="sb_bottom" style="position:relative;bottom:0;left:0;z-index:-10000;padding-top:5em;">
                <!-- Footer content -->
            </div>
        </div>
    </div>
</body>
</html>