function funPageLoad(){
    elmAllCultivarRadio = document.getElementById("inpAllCultivarsRadio");
    if(elmAllCultivarRadio.checked){
        funAllCultivarsClick();
    }else{
        funLimitedCultivarsClick();
    }
    
    arrAllInputs = document.getElementsByTagName("input");
    intAllInputsCounter = arrAllInputs.length;
    for (var intLoopCounter = 0; intLoopCounter < intAllInputsCounter; intLoopCounter++) {
        if(arrAllInputs[intLoopCounter].id.indexOf("inpDescriptorCheckbox_") > -1){
            if(arrAllInputs[intLoopCounter].checked){
                strFilterRowID = arrAllInputs[intLoopCounter].id.replace("inpDescriptorCheckbox", "trFilter");
                elmFilterRow = document.getElementById(strFilterRowID);
                elmFilterRow.style.visibility = "visible";
                elmFilterRow.style.display = "table-row";
            }
        }
    }
    
    
    // check for indeterminate for all categories
    for (var intOutterLoopCounter = 0; intOutterLoopCounter < intAllInputsCounter; intOutterLoopCounter++) {
        if(arrAllInputs[intOutterLoopCounter].id.indexOf("inpCategoryCheckbox_") > -1){
            intTotalDescriptorsInCategory = 0;
            intSelectedDescriptorsInCategory = 0;
            intCategoryKey = arrAllInputs[intOutterLoopCounter].id.split("_")[1];
            for (var intInnerLoopCounter = 0; intInnerLoopCounter < intAllInputsCounter; intInnerLoopCounter++) {
                if(arrAllInputs[intInnerLoopCounter].id.indexOf("inpDescriptorCheckbox_" + intCategoryKey + "_") > -1){
                    intTotalDescriptorsInCategory++;
                    if(arrAllInputs[intInnerLoopCounter].checked){
                        intSelectedDescriptorsInCategory++;
                    }
                }
            }
            // determine indeterminate
            if((intSelectedDescriptorsInCategory > 0) && (intTotalDescriptorsInCategory !== intSelectedDescriptorsInCategory)){
                arrAllInputs[intOutterLoopCounter].indeterminate = true;
            }else{
                arrAllInputs[intOutterLoopCounter].indeterminate = false;
            }
        }
    }
}

function funAllCultivarsClick(){
    elmCultivarContainer = document.getElementById("divCultivarSelectionContainer");
    elmCultivarContainer.style.visibility = "hidden";
    elmCultivarContainer.style.display = "none";
}

function funLimitedCultivarsClick(){
    elmCultivarContainer = document.getElementById("divCultivarSelectionContainer");
    elmCultivarContainer.style.visibility = "visible";
    elmCultivarContainer.style.display = "block";
}

function funCategoryClick(inc_element){
    intCategoryKey = inc_element.id.split("_")[1];
    arrAllInputs = document.getElementsByTagName("input");
    intAllInputsCounter = arrAllInputs.length;
    for (var intLoopCounter = 0; intLoopCounter < intAllInputsCounter; intLoopCounter++) {
        if(arrAllInputs[intLoopCounter].id.indexOf("inpDescriptorCheckbox_" + intCategoryKey + "_") > -1){
            strFilterRowID = arrAllInputs[intLoopCounter].id.replace("inpDescriptorCheckbox", "trFilter");
            elmFilterRow = document.getElementById(strFilterRowID);
            if(inc_element.checked){
                elmFilterRow.style.visibility = "visible";
                elmFilterRow.style.display = "table-row";
            }else{
                elmFilterRow.style.visibility = "hidden";
                elmFilterRow.style.display = "none";
            }
            arrAllInputs[intLoopCounter].checked = inc_element.checked;
        }
    }
}

function funDescriptorClick(inc_element){
    intCategoryKey = inc_element.id.split("_")[1];
    intTotalDescriptorsInCategory = 0;
    intSelectedDescriptorsInCategory = 0;
    elmCategory = document.getElementById("inpCategoryCheckbox_" + intCategoryKey);
    arrAllInputs = document.getElementsByTagName("input");
    intAllInputsCounter = arrAllInputs.length;
    for (var intLoopCounter = 0; intLoopCounter < intAllInputsCounter; intLoopCounter++) {
        if(arrAllInputs[intLoopCounter].id.indexOf("inpDescriptorCheckbox_" + intCategoryKey + "_") > -1){
            intTotalDescriptorsInCategory++;
            if(arrAllInputs[intLoopCounter].checked){
                intSelectedDescriptorsInCategory++;
            }
        }
    }
    // determine indeterminate
    if((intSelectedDescriptorsInCategory > 0) && (intTotalDescriptorsInCategory !== intSelectedDescriptorsInCategory)){
        elmCategory.indeterminate = true;
    }else{
        elmCategory.indeterminate = false;
    }
    // determine category checked or unchecked
    if(intTotalDescriptorsInCategory === intSelectedDescriptorsInCategory){
        elmCategory.checked = true;
    }else{
        elmCategory.checked = false;
    }
    
    
    strFilterRowID = inc_element.id.replace("inpDescriptorCheckbox", "trFilter");
    elmFilterRow = document.getElementById(strFilterRowID);
    if(inc_element.checked){
        elmFilterRow.style.visibility = "visible";
        elmFilterRow.style.display = "table-row";
    }else{
        elmFilterRow.style.visibility = "hidden";
        elmFilterRow.style.display = "none";
    }
    
    
}

function funExampleCultivarsClick(){
    elmCultivarsList = document.getElementById("tareaCultivarsList");
    elmCultivarsList.value = "PI92743\nPI80837\nPI89061\nPI90576-1\nPI89061N\nPI96169\nPI90566-1\nPI88818\nPI88353\nPI89002\n";
    
    //elmCultivarsList.value = "PI96983\nPI398697\nPI304218\nPI548493\nPI424487B\nPI200474\nPI172902\nPI97081\nPI548477\nPI424487B\n";
    elmFileSelect = document.getElementById("fileSelected");
    elmFileSelect.value = "";
}

function funFormSubmit(){
    boolDescriptorSelected = false;
    arrAllInputs = document.getElementsByTagName("input");
    intAllInputsCounter = arrAllInputs.length;
    for (var intLoopCounter = 0; intLoopCounter < intAllInputsCounter; intLoopCounter++) {
        if(arrAllInputs[intLoopCounter].id.indexOf("inpDescriptorCheckbox_") > -1 && arrAllInputs[intLoopCounter].checked){
            boolDescriptorSelected = true;
        }
    }
    if(!boolDescriptorSelected){
        alert("Please select at least one descriptor before proceeding.");
    }
    return boolDescriptorSelected;
}

function funFormReset(){
    location.reload(true);
}

function funResetCultivarsClick(){
    elmCultivarsList = document.getElementById("tareaCultivarsList");
    elmCultivarsList.value = "";
    elmFileSelect = document.getElementById("fileSelected");
    elmFileSelect.value = "";
}

function funCultivarFileChanged(){
    elmFileSelect = document.getElementById("fileSelected");
    var files = elmFileSelect.files; // FileList object
    f=files[0];
    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function() {
        return function(e) {
            elmCultivarsList = document.getElementById("tareaCultivarsList");
            elmCultivarsList.value = e.target.result;
        };
    })(f);

    reader.readAsText(f);
}


// calls to the server needs to be moved to it's own file
function fetchData(){
    fetch('http://localhost:3000/data') // Replace with your Express server URL
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Assuming your server sends JSON data
  })
  .then(data => {
    // Do something with the fetched data
    console.log(data); 
  })
  .catch(error => {
    // Handle errors
    console.error('There has been a problem with your fetch operation:', error);
  });
}

function fetchDataPost(){
    fetch('http://localhost:3000/data1', {
        method: "POST",
        body: JSON.stringify({
        id: 2916156,

  }),
  headers: {
    "Content-type": "application/json; charset=UTF-8"
  }
    }) // Replace with your Express server URL
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Assuming your server sends JSON data
  })
  .then(data => {
    // Do something with the fetched data
    console.log(data); 
  })
  .catch(error => {
    // Handle errors
    console.error('There has been a problem with your fetch operation:', error);
  });
}

async function getBrapi(){
    const url = "https://npgsweb.ars-grin.gov/gringlobal/brapi/v2/traits?commonCropName=GLYCINE-PERENNIAL";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      const json = await response.json();
      console.log(json);
    } catch (error) {
      console.error(error.message);
    }
}