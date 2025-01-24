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
    console.log("intCategoryKey", intCategoryKey)
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
    fetch('http://localhost:3000/data') // Replace with Express server URL
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

function getTraitValues(traitDbId){
    fetch(`http://localhost:3000/value/${traitDbId}`) // Replace with Express server URL
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Assuming your server sends JSON data
  })
  .then(data => {
    // Do something with the fetched data
    console.log("line 204 data",data); 
    findMinMax(data, 'value', traitDbId)
    
  })
  .catch(error => {
    // Handle errors
    console.error('There has been a problem with your fetch operation:', error);
  });
}


function findMinMax(arr, property, id) {
  console.log("findMinMax id: ", id)
    let min = Infinity;
    let max = -Infinity;
  
    for (let obj of arr) {
      let value = parseFloat(obj[property]);
      if (value < min) min = value;
      if (value > max) max = value;
    }
    console.log({ min, max }) ;

    let checkedbox = document.getElementById(id)
    let sliderbox = document.getElementById(id + '-slider')
    let valuebox = document.getElementById(id + '-value-output')
    let selectbox = document.getElementById(id + '-select');

    if(checkedbox.checked){
      renderValueSlider(min, max, id)
    }
    else{
      if(sliderbox !== null){
        sliderbox.remove();

      }
      if(valuebox !== null){

        valuebox.remove();
      }
      if(selectbox !== null){

        selectbox.remove();
      }
    }
  }

  function renderValueSlider(min, max, id){

    if(min !== Infinity) {
      console.log("renderValueSlider id:", id)
      const container = document.getElementById(id + '-value-slider')
      console.log("container: ",container)
      
      const slider =  document.createElement('input')
       
      slider.setAttribute("step", "0.1")
          slider.type = 'range'
          slider.id = id + '-slider'
          slider.min = min
          slider.max = max
          slider.defaultValue = min;
          slider.classList.add('uk-margin-medium-left')
          slider.classList.add('uk-margin-small-top')
          slider.classList.add('uk-margin-small-bottom')
          
          const valueOutput = document.createElement('span')
          container.appendChild(slider)
          container.appendChild(valueOutput)
  
          valueOutput.id = id + '-value-output';
          let rangslider = document.getElementById(id + '-slider')
          let output = document.getElementById(id + "-value-output");
              output.innerHTML = min;
            output.classList.add('uk-margin-small-left')
            output.classList.add('uk-margin-small-top')
            output.classList.add('uk-margin-small-bottom')
            rangslider.oninput = function () {
            output.innerHTML = this.value;
          }
    }else {

      // render select dropdown
      const container = document.getElementById(id + '-value-slider')
      
      const select =  document.createElement('select')
      
      
      select.id = id + '-select'
      select.classList.add('uk-margin-medium-left')
      select.classList.add('uk-margin-small-top')
      select.classList.add('uk-margin-small-bottom')
      select.classList.add('uk-select')
      select.classList.add('uk-form-width-small')
      
      // for testing need to retrieve from json??
      const optionsArr = [
        'option 1', 'option 2', 'option 3'
      ]
      
      // render options for selection element
      optionsArr.forEach(option => {
        container.appendChild(select)
        const selectContainer = document.getElementById(id + '-select')
        const options = document.createElement('option')
        options.value = option
        options.innerHTML = option
        selectContainer.appendChild(options)
      })
     
    }
  
          

  
  
  
  }

  

async function getBrapi(){
    fetch('http://localhost:3000/brapi') // Replace with Express server URL
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Assuming your server sends JSON data
    })
    .then(data => {
      // Do something with the fetched data
      console.log(data.result.data); 
      const container = document.getElementById('results')
      data.result.data.forEach( i => {
        const listItem = document.createElement('li');
        listItem.textContent = i.traitName;
        container.appendChild(listItem)
      })
    })
    .catch(error => {
      // Handle errors
      console.error('There has been a problem with your fetch operation:', error);
    });
}



async function renderTraitsCheckbox(){
    //fetch data
    fetch('./data/traits-Glycine.json')
    .then(response => response.json())
    .then(data => {
        // create unique value of Top Level traits
        let traitsSet = new Set()
      for (const item of data) {
        traitsSet.add(item.traitClass)
      }
      console.log(traitsSet)

      // Create checkbox and render traitClass
      const container = document.getElementById('traits-dropdown')
      traitsSet.forEach(trait =>{
        console.log('traitClass', trait)
        const traitNameDiv = document.createElement('div');
        const checkbox = document.createElement('input');
        traitNameDiv.setAttribute('id',trait)
        checkbox.type = 'checkbox';
        checkbox.id = trait;
        checkbox.name = trait;
        checkbox.value = trait;
  
        const label = document.createElement('label');
        // label.htmlFor = item.id;
        document.body.appendChild(traitNameDiv);
        label.textContent = trait; 
        checkbox.classList.add('uk-checkbox');
        checkbox.classList.add('uk-margin-small-right');
        traitNameDiv.appendChild(checkbox);
        traitNameDiv.appendChild(label);
        traitNameDiv.appendChild(document.createElement('br'));
        traitNameDiv.classList.add('uk-card');
        traitNameDiv.classList.add('uk-card-default');
        traitNameDiv.classList.add('uk-card-body');
        traitNameDiv.classList.add('uk-padding-small');
        traitNameDiv.classList.add('uk-margin-remove-top');
        traitNameDiv.classList.add('uk-margin-medium-right')
        // traitNameDiv.classList.add('uk-margin-medium-left')
        traitNameDiv.classList.add('uk-margin-medium-bottom')
        
        container.appendChild(traitNameDiv)
        // Create checkboxes and Render traitName under unique classes
        data.forEach(item => {
            const traitNames_container = document.getElementById(trait);

            if(item.traitClass === trait){

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = item.traitDbId; 
                checkbox.name = item.traitName;
                checkbox.value = item.traitDbId;
                checkbox.setAttribute("onclick", "getTraitValues(this.value)")
          
                const label = document.createElement('label');
                label.textContent = item.traitName;

                const sliderContainer = document.createElement('div');
                sliderContainer.setAttribute('id', item.traitDbId + '-value-slider')
                sliderContainer.classList.add('uk-flex')
                traitNames_container.appendChild(checkbox);
                traitNames_container.appendChild(label);
                traitNames_container.style.minWidth = "380px";
                label.setAttribute("uk-tooltip",item.traitDescription)
                traitNames_container.appendChild(document.createElement('br'));
                checkbox.classList.add('uk-margin-medium-left');
                checkbox.classList.add('uk-checkbox');
                checkbox.classList.add('uk-margin-small-right');

                traitNames_container.appendChild(sliderContainer)
    
            }
        })
      })
    })

    .catch(error => console.error('Error:', error));
}



async function getObservationData(){
    fetch('./data/observations-Glycine.json')
  .then(response => response.json())
  .then(data => {
    // Loop through the JSON data
    for (let key in data) {
      console.log(key + ": " + data[key]);
    }
  })
  .catch(error => console.error('Error:', error)); 
}


window.onload = renderTraitsCheckbox();