<?php
    ini_set('memory_limit', '2048M');
    ini_set('display_errors',1);
    error_reporting(E_ALL ^ (E_NOTICE | E_WARNING | E_DEPRECATED));
    $dbConnectionSoybase = new PDO('mysql:host=localhost;dbname=soybase', 'www', '');

    // FIX - Get an array of all possible distinct cultivars
        $arrDistinctCultivarResults = array();
        $strSQLDistinctCultivars = "SELECT DISTINCT(cultivar_name) FROM germplasm_grin_descriptor_data"; 
        $prepSQLDistinctCultivars = $dbConnectionSoybase->prepare($strSQLDistinctCultivars);
        $prepSQLDistinctCultivars->execute();
        $arrDistinctCultivars = $prepSQLDistinctCultivars->fetchAll(PDO::FETCH_ASSOC);
        $arrDistinctCultivars = array_column($arrDistinctCultivars, 'cultivar_name');

    // get the requested cultivars into an array and string - $arrRequestedCultivars, $strRequestedCultivars
        $strRequestedCultivars = "";
        $strRequestedCultivarsRaw = "";
        $arrRequestedCultivars = array();
        //$strRequestedCultivarsType = filter_input(INPUT_POST, "inpCultivarsRadio", FILTER_SANITIZE_STRING);
        $strRequestedCultivarsType = htmlspecialchars(INPUT_POST, ENT_HTML401,NULL,TRUE);
        if($strRequestedCultivarsType === "LIMIT"){
            $strRequestedCultivarsRaw = filter_input(INPUT_POST, "tareaCultivarsList", FILTER_SANITIZE_STRING);
            $arrRequestedCultivars = explode("\n",$strRequestedCultivarsRaw);
            $arrRequestedCultivars = array_filter($arrRequestedCultivars);
            $arrRequestedCultivars = array_map("trim", $arrRequestedCultivars);
            $strRequestedCultivars = implode("','", $arrRequestedCultivars);
            $strRequestedCultivars = "'".htmlspecialchars($strRequestedCultivars)."'";
        }


    // FIX - Check for non-standard cultivar names and translate them
        $intAlternateNamesCount = 0;
        if(!empty($arrRequestedCultivars)){
            $strSQLAlternateNames = "SELECT * FROM germplasm_grin_othernames WHERE alternate_name IN (".$strRequestedCultivars.")";
            $prepSQLAlternateNames = $dbConnectionSoybase->prepare($strSQLAlternateNames);
            $prepSQLAlternateNames->execute();
            $arrAlternateNames = $prepSQLAlternateNames->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($arrAlternateNames))
            	$intAlternateNamesCount = $prepSQLAlternateNames->rowCount();
            	$intCultivarsCount = $prepSQLAlternateNames->rowCount();
            	if($intAlternateNamesCount > 0){
                	for($intOutterCounter = 0; $intOutterCounter < $intAlternateNamesCount; $intOutterCounter++){
                    	// look at each alternate_name found and replace it in the $arrRequestedCultivars and $strRequestedCultivars variables
                    	// with the grin_name
                    	for($intInnerCounter = 0; $intInnerCounter < $intCultivarsCount; $intInnerCounter++){
                       		if($arrAlternateNames[$intOutterCounter]["alternate_name"] == $arrRequestedCultivars[$intInnerCounter]){
                            	$arrRequestedCultivars[$intInnerCounter] = $arrAlternateNames[$intOutterCounter]["grin_name"];
                        	}
                    	}
                	}
                $strRequestedCultivars = implode("','", $arrRequestedCultivars);
                $strRequestedCultivars = "'".$strRequestedCultivars."'";
            	}
            }
        }

    // FIX - Create a list of cultivars that were not found in our database
        $arrMissingCultivars = array();
        if(!empty($arrRequestedCultivars)){
            $arrMissingCultivars = array_diff($arrRequestedCultivars, $arrDistinctCultivars);
            if(!empty($arrMissingCultivars)){
                $arrRequestedCultivars = array_diff($arrRequestedCultivars, $arrMissingCultivars);
                $strRequestedCultivars = implode("','", $arrRequestedCultivars);
                $strRequestedCultivars = "'".$strRequestedCultivars."'";
                $strMissingCultivars = implode(", ", $arrMissingCultivars);
                $strMissingCultivars = htmlspecialchars($strMissingCultivars).".";
            }
        }
        unset($arrDistinctCultivars);





    // get all the specifics about the request that was made - $arrRequestSpecifics
        $arrCategories = array(
             "Disease",
             "Insect",
             "Nematode",
             "Stress",
             "Morphology",
             "Growth",
             "Root",
             "Phenology",
             "Chemical",
             "Production",
             "User Submitted"
        );
        $strSQLRequestSpecifics = "SELECT * FROM germplasm_grin_descriptor_definitions";
        $prepSQLRequestSpecifics = $dbConnectionSoybase->prepare($strSQLRequestSpecifics);
        $prepSQLRequestSpecifics->execute();
        $arrRequestSpecifics = $prepSQLRequestSpecifics->fetchAll(PDO::FETCH_ASSOC);
        $intRequestSpecificsCount = ($prepSQLRequestSpecifics->rowCount());
        for($intCounter = 0; $intCounter < $intRequestSpecificsCount; $intCounter++){
            $intCategoryKey = array_search($arrRequestSpecifics[$intCounter]["descriptor_category"], $arrCategories);
            $arrRequestSpecifics[$intCounter]["selected"] = htmlspecialchars($_POST["inpDescriptorCheckbox_".$intCategoryKey."_".$arrRequestSpecifics[$intCounter]["id"]] ?? 'default',ENT_HTML401,NULL,TRUE);
            //$arrRequestSpecifics[$intCounter]["selected"] = filter_input(INPUT_POST, "inpDescriptorCheckbox_".$intCategoryKey."_".$arrRequestSpecifics[$intCounter]["id"], FILTER_SANITIZE_STRING);
            if($arrRequestSpecifics[$intCounter]["selected"] == "yes"){
                if(!empty($arrRequestSpecifics[$intCounter]["descriptor_distincts"])){
			//$arrRequestSpecifics[$intCounter]["selected_option"] = filter_input(INPUT_POST, "selDescriptorValue_".$arrRequestSpecifics[$intCounter]["id"], FILTER_SANITIZE_STRING);
                          $arrRequestSpecifics[$intCounter]["selected_option"] = htmlspecialchars($_POST["selDescriptorValue_".$arrRequestSpecifics[$intCounter]["id"]] ?? 'default',ENT_HTML401,NULL,TRUE);
                }else{
                    $arrRequestSpecifics[$intCounter]["selected_min"] = filter_input(INPUT_POST, "inpDescriptorValueMin_".$arrRequestSpecifics[$intCounter]["id"], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
                    $arrRequestSpecifics[$intCounter]["selected_max"] = filter_input(INPUT_POST, "inpDescriptorValueMax_".$arrRequestSpecifics[$intCounter]["id"], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
                }
            }
        }

    // put all the relevant descriptors in a comma delimited and double-quoted string - $strRelevantDescriptorsList
        $arrChosenDescriptors = array();
        $strRelevantDescriptorsList = "";
        for($intCounter = 0; $intCounter < $intRequestSpecificsCount; $intCounter++){
            if($arrRequestSpecifics[$intCounter]["selected"] == "yes"){
                array_push($arrChosenDescriptors, $arrRequestSpecifics[$intCounter]["descriptor_shortname"]);
            }
        }
        $strRelevantDescriptorsList = implode("','", $arrChosenDescriptors);
        $strRelevantDescriptorsList = "'".$strRelevantDescriptorsList."'";

    // find all the relevant distinct cultivars, this is our maximum results - $arrMaximumResults
        if(empty($arrRequestedCultivars)){
            //$strSQLDistinctCultivars = "SELECT DISTINCT(CONCAT(cultivar_name,'_',grin_acc_id)) AS strKey FROM germplasm_grin_descriptor_data ORDER BY cultivar_name, grin_acc_id";
			$strSQLDistinctCultivars = "SELECT DISTINCT(CONCAT(cultivar_name,'_',grin_acc_id)) AS strKey FROM germplasm_grin_descriptor_data ORDER BY strKey";
        }else{
            //$strSQLDistinctCultivars = "SELECT DISTINCT(CONCAT(cultivar_name,'_',grin_acc_id)) AS strKey FROM germplasm_grin_descriptor_data WHERE cultivar_name IN (".$strRequestedCultivars.") ORDER BY cultivar_name, grin_acc_id";
			$strSQLDistinctCultivars = "SELECT DISTINCT(CONCAT(cultivar_name,'_',grin_acc_id)) AS strKey FROM germplasm_grin_descriptor_data WHERE cultivar_name IN (".$strRequestedCultivars.") ORDER BY strKey";
        }
        
        /*
        if(empty($arrRequestedCultivars)){
            $strSQLDistinctCultivars = "SELECT DISTINCT(CONCAT(id,'_',cultivar_name,'_',grin_acc_id)) AS strKey FROM germplasm_grin_descriptor_data ORDER BY id, cultivar_name, grin_acc_id";
        }else{
            $strSQLDistinctCultivars = "SELECT DISTINCT(CONCAT(id,'_',cultivar_name,'_',grin_acc_id)) AS strKey FROM germplasm_grin_descriptor_data WHERE cultivar_name IN (".$strRequestedCultivars.") ORDER BY id, cultivar_name, grin_acc_id";
        }
         
         */
        $prepSQLDistinctCultivars = $dbConnectionSoybase->prepare($strSQLDistinctCultivars);
        $prepSQLDistinctCultivars->execute();
        $arrDistinctCultivarResults = $prepSQLDistinctCultivars->fetchAll(PDO::FETCH_ASSOC);
        $arrMaximumResults = array_fill_keys(array_column($arrDistinctCultivarResults, "strKey"), array_fill_keys(array_merge(array("cultivar_name", "grin_acc_id"), $arrChosenDescriptors), "")) ;
        unset($arrDistinctCultivarResults);

		//echo "<pre>";
		//print_r($arrMaximumResults);
		//echo "</pre>";
		//exit;

    // fill in the cultivar_name and grin_acc_id for our maximum results
        foreach($arrMaximumResults as $strMaximumResultsKey => $arrMaximumResultsValue){
            $arrMaximumResultsFields = explode("_", $strMaximumResultsKey);
            $arrMaximumResults[$strMaximumResultsKey]["cultivar_name"] = $arrMaximumResultsFields[0];
            $arrMaximumResults[$strMaximumResultsKey]["grin_acc_id"] = $arrMaximumResultsFields[1];
            /*
            $arrMaximumResults[$strMaximumResultsKey]["cultivar_name"] = $arrMaximumResultsFields[1];
            $arrMaximumResults[$strMaximumResultsKey]["grin_acc_id"] = $arrMaximumResultsFields[2];
             
             */
        }

		//echo "<pre>";
		//print_r($arrMaximumResults);
		//echo "</pre>";
		//exit;


    // retrieve all the possible relevant descriptor values - $arrDescriptorValueResults
        if(empty($arrRequestedCultivars)){
            $strSQLDescriptorValues = "SELECT * FROM germplasm_grin_descriptor_data WHERE descriptor_shortname IN (".$strRelevantDescriptorsList.") ORDER BY cultivar_name, grin_acc_id";
        }else{
            $strSQLDescriptorValues = "SELECT * FROM germplasm_grin_descriptor_data WHERE descriptor_shortname IN (".$strRelevantDescriptorsList.") AND cultivar_name IN (".$strRequestedCultivars.") ORDER BY cultivar_name, grin_acc_id";
        }
        /*
        if(empty($arrRequestedCultivars)){
            $strSQLDescriptorValues = "SELECT * FROM germplasm_grin_descriptor_data WHERE descriptor_shortname IN (".$strRelevantDescriptorsList.") ORDER BY id, cultivar_name, grin_acc_id";
        }else{
            $strSQLDescriptorValues = "SELECT * FROM germplasm_grin_descriptor_data WHERE descriptor_shortname IN (".$strRelevantDescriptorsList.") AND cultivar_name IN (".$strRequestedCultivars.") ORDER BY id, cultivar_name, grin_acc_id";
        }
         
         */
        $prepSQLDescriptorValues = $dbConnectionSoybase->prepare($strSQLDescriptorValues);
        $prepSQLDescriptorValues->execute();
        $arrDescriptorValueResults = $prepSQLDescriptorValues->fetchAll(PDO::FETCH_ASSOC);

    // fill our maximum results array with the descriptor value results and the cultivar name and grin_acc_id
        $intDescriptorValueResultsCount = count($arrDescriptorValueResults);
        for($intCounter = 0; $intCounter < $intDescriptorValueResultsCount; $intCounter++){
            /*
            $strConcatenatedKey = $arrDescriptorValueResults[$intCounter]["id"]."_".$arrDescriptorValueResults[$intCounter]["cultivar_name"]."_".$arrDescriptorValueResults[$intCounter]["grin_acc_id"];
             
             */
            $strConcatenatedKey = $arrDescriptorValueResults[$intCounter]["cultivar_name"]."_".$arrDescriptorValueResults[$intCounter]["grin_acc_id"];
            $arrMaximumResults[$strConcatenatedKey][$arrDescriptorValueResults[$intCounter]["descriptor_shortname"]] = $arrDescriptorValueResults[$intCounter]["descriptor_value"];
        }

    // descriptor filtering
        for($intCounter = 0; $intCounter < $intRequestSpecificsCount; $intCounter++){
            if($arrRequestSpecifics[$intCounter]["selected"] == "yes"){
                if(!empty($arrRequestSpecifics[$intCounter]["descriptor_distincts"])){
                    // if anything but _ANY_ was selected, then we need to search our array
                    if($arrRequestSpecifics[$intCounter]["selected_option"] !== "_ANY_"){
                        foreach($arrMaximumResults as $strMaximumResultsKey => $arrMaximumResultsValue){
                            if((strpos($arrMaximumResultsValue[$arrRequestSpecifics[$intCounter]["descriptor_shortname"]], ",") > -1) || (strpos($arrMaximumResultsValue[$arrRequestSpecifics[$intCounter]["descriptor_shortname"]], ";") > -1)){
                                // has commas or semicolons
                                $arrCommaOrSemicolonValues = preg_split("/[;,]/u", $arrMaximumResultsValue[$arrRequestSpecifics[$intCounter]["descriptor_shortname"]]);
                                $boolMatchingValueFound = false;
                                foreach($arrCommaOrSemicolonValues AS $strCommaOrSemicolonValue){
                                    if($strCommaOrSemicolonValue === $arrRequestSpecifics[$intCounter]["selected_option"]){
                                        $boolMatchingValueFound = true;
                                    }
                                }
                                if(!$boolMatchingValueFound){
                                    $arrMaximumResults[$strMaximumResultsKey] = null;
                                }
                            }else{
                                // no commas or semicolons
                                if($arrMaximumResultsValue[$arrRequestSpecifics[$intCounter]["descriptor_shortname"]] !== $arrRequestSpecifics[$intCounter]["selected_option"]){
                                    $arrMaximumResults[$strMaximumResultsKey] = null;
                                }
                            }
                        }
                    }
                }else{
                    // if the user selected anything but the default min/max, then we need to search our array
                    if(($arrRequestSpecifics[$intCounter]["selected_min"] != $arrRequestSpecifics[$intCounter]["descriptor_min"]) || ($arrRequestSpecifics[$intCounter]["selected_max"] != $arrRequestSpecifics[$intCounter]["descriptor_max"])){
                        foreach($arrMaximumResults as $strMaximumResultsKey => $arrMaximumResultsValue){
                            if((strpos($arrMaximumResultsValue[$arrRequestSpecifics[$intCounter]["descriptor_shortname"]], ",") > -1) || (strpos($arrMaximumResultsValue[$arrRequestSpecifics[$intCounter]["descriptor_shortname"]], ";") > -1)){
                                // has commas or semicolons
                                $arrCommaOrSemicolonValues = preg_split("/[;,]/u", $arrMaximumResultsValue[$arrRequestSpecifics[$intCounter]["descriptor_shortname"]]);
                                $boolMatchingValueFound = false;
                                foreach($arrCommaOrSemicolonValues AS $strCommaOrSemicolonValue){
                                    if(($strCommaOrSemicolonValue >= $arrRequestSpecifics[$intCounter]["selected_min"]) && ($strCommaOrSemicolonValue <= $arrRequestSpecifics[$intCounter]["selected_max"])){
                                        $boolMatchingValueFound = true;
                                    }
                                }
                                if(!$boolMatchingValueFound){
                                    $arrMaximumResults[$strMaximumResultsKey] = null;
                                }
                            }else{
                                // no commas or semicolons
                                if(($arrMaximumResultsValue[$arrRequestSpecifics[$intCounter]["descriptor_shortname"]] < $arrRequestSpecifics[$intCounter]["selected_min"]) || ($arrMaximumResultsValue[$arrRequestSpecifics[$intCounter]["descriptor_shortname"]] > $arrRequestSpecifics[$intCounter]["selected_max"])){
                                    $arrMaximumResults[$strMaximumResultsKey] = null;
                                }
                            }
                        }
                    }
                }
            }
        }
        $arrMaximumResults = array_filter($arrMaximumResults);

    // if we have results, find the table size and label whether it will be the full set
        $boolCompleteResults = true;
        if(count($arrMaximumResults) > 0){
            $arrTempColumnHelper = array_keys($arrMaximumResults);
            $strTempColumnHelper = $arrTempColumnHelper[0];
            $intMaximumColumns = count($arrMaximumResults[$strTempColumnHelper]);

            if($intMaximumColumns > 5){
                $boolCompleteResults = false;
                $intMaximumColumns = 3;
            }

            $intMaximumRows = count($arrMaximumResults);
            if($intMaximumRows > 10){
                $boolCompleteResults = false;
                $intMaximumRows = 10;
            }
        }

    // if we have results, build an array to lookup descriptor longnames based off of shortnames - $arrDescriptorLongNames
        $arrDescriptorLongNames = array();
        if(count($arrMaximumResults) > 0){
            for($intCounter = 0; $intCounter < $intRequestSpecificsCount; $intCounter++){
                if($arrRequestSpecifics[$intCounter]["selected"] == "yes"){
                    $arrDescriptorLongNames[$arrRequestSpecifics[$intCounter]["descriptor_shortname"]] = $arrRequestSpecifics[$intCounter]["descriptor_longname"];
                }
            }
        }




?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <link rel=stylesheet type="text/css" href="../../include/sb_styles.css">
        <title>GRIN Data Explorer - Results</title>
        <?php include_once("../../include/include.php");?>
	<?php new_head_javascript(); ?>
        <link rel="stylesheet" type="text/css" href="styles.css">
        <script type="text/javascript" src="scripts.js"></script>
    </head>
    <body id="bdyBody">
        <?php include("../../include/NewHeadSoy.txt"); ?>
	<div class="sb_middle2">
            <div class="sb_main2">
                <div id="divGrin">
                    <div id="divMainFormContainer">
                        <form action="results_download.php" method="post" id="frmGrin" name="frmGrin">
                            <input type="hidden" name="inpCultivarsRadio" id="inpCultivarsRadio" value="<?php echo $strRequestedCultivarsType; ?>">
                            <input type="hidden" name="tareaCultivarsList" id="tareaCultivarsList" value="<?php echo $strRequestedCultivarsRaw; ?>">
                            <?php
                                for($intCounter = 0; $intCounter < $intRequestSpecificsCount; $intCounter++){
                                    $intCategoryKey = array_search($arrRequestSpecifics[$intCounter]["descriptor_category"], $arrCategories);
                                    if($arrRequestSpecifics[$intCounter]["selected"] == "yes"){
                                        $strElementID = "inpDescriptorCheckbox_".$intCategoryKey."_".$arrRequestSpecifics[$intCounter]["id"];
                                            ?>
                                                <input type="hidden" name="<?php echo $strElementID; ?>" id="<?php echo $strElementID; ?>" value="yes">
                                            <?php
                                        if(!empty($arrRequestSpecifics[$intCounter]["descriptor_distincts"])){
                                            $strElementID = "selDescriptorValue_".$arrRequestSpecifics[$intCounter]["id"];
                                                ?>
                                                    <input type="hidden" name="<?php echo $strElementID; ?>" id="<?php echo $strElementID; ?>" value="<?php echo $arrRequestSpecifics[$intCounter]["selected_option"]; ?>">
                                                <?php
                                        }else{
                                            $strElementID = "inpDescriptorValueMin_".$arrRequestSpecifics[$intCounter]["id"];
                                                ?>
                                                    <input type="hidden" name="<?php echo $strElementID; ?>" id="<?php echo $strElementID; ?>" value="<?php echo $arrRequestSpecifics[$intCounter]["selected_min"]; ?>">
                                                <?php
                                            $strElementID = "inpDescriptorValueMax_".$arrRequestSpecifics[$intCounter]["id"];
                                                ?>
                                                    <input type="hidden" name="<?php echo $strElementID; ?>" id="<?php echo $strElementID; ?>" value="<?php echo $arrRequestSpecifics[$intCounter]["selected_max"]; ?>">
                                                <?php
                                        }
                                    }
                                }
                            ?>
                            <div id="divTitleText" class="top_bar">
                                GRIN Data Explorer - Results
                            </div>
                            <div id="divHelpContainer">
                                <?php
                                    if(empty($arrMaximumResults)){
                                        ?>
                                            <p class='clsHelpText'>
                                                Sorry, we could not find any results that match your request. Please, <a href="javascript:window.history.back();">go back</a> and try a different search.
                                            </p>
                                        <?php
                                    }else{
                                        ?>
                                            <p class='clsHelpText'>
                                                We found <strong><?php echo number_format(count($arrMaximumResults)); ?></strong> result(s) that match your request.
                                            </p>
                                            <?php
                                                if(!empty($arrMissingCultivars)){
                                                    ?>
                                                        <p class='clsHelpText'>
                                                            Sorry, the following cultivars you submitted were not found in our database: <?php echo $strMissingCultivars; ?>
                                                        </p>
                                                    <?php
                                                }
                                            ?>
                                            <?php
                                                if(!$boolCompleteResults){
                                                    ?>
                                                        <p class='clsHelpText'>
                                                            Below is a <strong>sample</strong> of your results. Up to three descriptors and ten accessions will be shown in the preview below. To download all matching records, click the Download All Results button below.
                                                        </p>
                                                    <?php
                                                }else{
                                                    ?>
                                                        <p class='clsHelpText'>
                                                            The following table contains the entirety of your results. To download these matching records, click the Download All Results button below.
                                                        </p>
                                                    <?php
                                                }
                                            ?>
                                            <p class='clsHelpText'>
                                                Please note, some traits may contain multiple values.
                                            </p>
                                            <div id="divTopButtonsContainer">
                                                <button id="btnTopSubmitMainForm" class="clsButton" type="submit">Download All Results</button>
                                            </div>
                                            <table id="tblGRINResults">
                                                <thead>
                                                    <tr>
                                                        <th>GRIN Accession</th>
                                                        <?php
                                                            if($intAlternateNamesCount > 0){
                                                                echo "<th>Alternate Name</th>";
                                                            }
                                                            $intMaxColumnsCounter = 0;
                                                            foreach($arrDescriptorLongNames as $strDescriptorLongName){
                                                                echo "<th>".$strDescriptorLongName."</th>";
                                                                $intMaxColumnsCounter++;
                                                                if($intMaxColumnsCounter == $intMaximumColumns){
                                                                    break;
                                                                }
                                                            }
                                                        ?>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <?php
                                                        $intMaxRowsCounter = 0;
                                                        foreach($arrMaximumResults as $arrMaximumResult){
                                                            ?>
                                                                <tr>
                                                                    <td><?php echo $arrMaximumResult["cultivar_name"]; ?></td>
                                                                    <?php

                                                                        if($intAlternateNamesCount > 0){
                                                                            echo "<td>";
                                                                            for($intOutterCounter = 0; $intOutterCounter < $intAlternateNamesCount; $intOutterCounter++){
                                                                                // look for this cultivar name in our alternate names array
                                                                                if($arrAlternateNames[$intOutterCounter]["grin_name"] == $arrMaximumResult["cultivar_name"]){
                                                                                    echo $arrAlternateNames[$intOutterCounter]["alternate_name"];
                                                                                }
                                                                            }
                                                                            echo "</td>";
                                                                        }

                                                                        $intMaxColumnsCounter = 0;
                                                                        foreach($arrDescriptorLongNames as $strDescriptorShortName => $strDescriptorLongName){
                                                                            echo "<td>".$arrMaximumResult[$strDescriptorShortName]."</td>";
                                                                            $intMaxColumnsCounter++;
                                                                            if($intMaxColumnsCounter == $intMaximumColumns){
                                                                                break;
                                                                            }
                                                                        }
                                                                    ?>
                                                                </tr>
                                                            <?php
                                                            $intMaxRowsCounter++;
                                                            if($intMaxRowsCounter == $intMaximumRows){
                                                                break;
                                                            }
                                                        }
                                                    ?>
                                                </tbody>
                                            </table>
                                            <div id="divMainButtonsContainer">
                                                <button id="btnSubmitMainForm" class="clsButton" type="submit">Download All Results</button>
                                            </div>
                                        <?php
                                    }
                                ?>
                            </div>
                        </form>
                    </div>
                </div>
		<div class="sb_bottom" style='position:relative;bottom:0;left:0;z-index:-10000;padding-top:5em;'>
		<?php
			build_bottom();
		?>
                </div>
            </div>
	</div>
    </body>
</html>