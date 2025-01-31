
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
    let minBox = document.getElementById(`${id}-min`);
    let maxBox = document.getElementById(`${id}-max`);
    let valuebox = document.getElementById(`${id}-value-output`)
    let minValueBox = document.getElementById(`${id}-min-value-output`)
    let maxValueBox = document.getElementById(`${id}-max-value-output`)
    let selectbox = document.getElementById(`${id}-select`);

    if(checkedbox.checked){
      renderMinMaxInput(min, max, id, arr)
    }
    else{
      if(minValueBox !== null){  
      minBox.remove();
      maxBox.remove();
      minValueBox.remove();
      maxValueBox.remove();

      }
      if(valuebox !== null){
        valuebox.remove();
      }
      if(selectbox !== null){
        selectbox.remove();
      }
    }
    }
    
  

  // render min and max input box
  function renderMinMaxInput(min, max, id, data){
    if(min !== Infinity && max !== 0) {
      renderMinInput(min, id)
      renderMaxInput(max, id)
    }else {

      // render select dropdown
      const container = document.getElementById(`${id}-value-min-max`)
      const select =  document.createElement('select')
        
      select.id = `${id}-select`
      select.classList.add('uk-margin-medium-left','uk-margin-small-top','uk-margin-small-bottom','uk-select','uk-form-width-small')
      
       // create unique value array
    let options = new Set(['any'])
    data.forEach(obj => {
        if(obj.observationVariableDbId === id){
            options.add(obj.value)
        }
    })
        
        // render select options
    options.forEach(option => {
        container.appendChild(select)
        const selectContainer = document.getElementById(`${id}-select`)
        const options = document.createElement('option')
        options.value = option
        options.innerHTML = option
        selectContainer.appendChild(options)
      })   
    } 
  }


  function uniqueSelectionOption(data,id){
    let options = new Set()
    data.forEach(obj => {
        if(obj.observationVariableDbId === id){
            options.add(obj.value)
        }
        console.log(options)
    })
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



async function renderTraitsCheckbox() {
    try {
        // Fetch data
        const response = await fetch('./data/traits-Glycine.json');
        const data = await response.json();

        // Create a unique set of top-level trait classes
        const traitsSet = new Set(data.map(item => item.traitClass));
        console.log(traitsSet);

        // Get the container element
        const container = document.getElementById('traits-dropdown');

        // Create checkboxes for each unique trait class
        traitsSet.forEach(traitClass => {
            console.log('traitClass:', traitClass);

            const traitContainer = document.createElement('div');
            traitContainer.id = traitClass;
            traitContainer.classList.add('uk-card', 'uk-card-default', 'uk-card-body', 
                                         'uk-padding-small', 'uk-margin-remove-top', 
                                         'uk-margin-medium-right', 'uk-margin-medium-bottom');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = traitClass;
            checkbox.name = traitClass;
            checkbox.value = traitClass;
            checkbox.classList.add('uk-checkbox', 'uk-margin-small-right');

            const label = document.createElement('label');
            label.textContent = traitClass;

            traitContainer.append(checkbox, label, document.createElement('br'));
            container.appendChild(traitContainer);

            // Append trait-specific checkboxes
            data.filter(item => item.traitClass === traitClass).forEach(item => {
                const traitItemCheckbox = document.createElement('input');
                traitItemCheckbox.type = 'checkbox';
                traitItemCheckbox.id = item.traitDbId;
                traitItemCheckbox.name = item.traitName;
                traitItemCheckbox.value = item.traitDbId;
                traitItemCheckbox.setAttribute("onclick", "getTraitValues(this.value)");
                traitItemCheckbox.classList.add('uk-margin-medium-left', 'uk-checkbox', 'uk-margin-small-right');

                const traitLabel = document.createElement('label');
                traitLabel.textContent = item.traitName;
                traitLabel.setAttribute("uk-tooltip", item.traitDescription);

                const sliderContainer = document.createElement('div');
                sliderContainer.id = `${item.traitDbId}-value-min-max`;
                sliderContainer.classList.add('uk-flex');

                traitContainer.style.minWidth = "380px";
                traitContainer.append(traitItemCheckbox, traitLabel, document.createElement('br'), sliderContainer);
            });
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// function tonrender min input box
function renderMinInput(min, id){
    console.log("renderMinMaxInput id:", id)
    const container = document.getElementById(`${id}-value-min-max`)
    console.log("container: ",container)
    const minInput =  document.createElement('input')
      
  minInput.type = 'text'
  minInput.id = id + '-min'
  minInput.min = min
  minInput.defaultValue = min;
  minInput.classList.add('uk-margin-medium-left','uk-margin-small-top','uk-margin-small-bottom', 'uk-form-width-xsmall', 'uk-input')
  
  const valueOutput = document.createElement('span')
  container.appendChild(minInput)
  container.appendChild(valueOutput)

  valueOutput.id = id + '-min-value-output';
  let rangminInput = document.getElementById(`${id}-min`)
  let output = document.getElementById(`${id}-min-value-output`);
      output.innerHTML = `min: ${min}`;
    output.classList.add('uk-margin-small-left','uk-margin-small-top','uk-margin-small-bottom')
    rangminInput.oninput = function () {
    output.innerHTML = `min: ${this.value}`;
  }
  }

// function to render max input box
  function renderMaxInput(max, id){
    console.log("renderMinMaxInput id:", id)
    const container = document.getElementById(`${id}-value-min-max`)
    console.log("container: ",container)
    const maxInput = document.createElement('input')       

  maxInput.type = 'text'
  maxInput.id = id + '-max'
  maxInput.max = max
  maxInput.defaultValue = max;
  maxInput.classList.add('uk-margin-medium-left','uk-margin-small-top','uk-margin-small-bottom', 'uk-form-width-xsmall', 'uk-input')
  
  const valueOutput = document.createElement('span')
  container.appendChild(maxInput)
  container.appendChild(valueOutput)

  valueOutput.id = id + '-max-value-output';
  let rangMaxInput = document.getElementById(`${id}-max`)
  let output = document.getElementById(`${id}-max-value-output`);
      output.innerHTML = `max: ${max}`;
    output.classList.add('uk-margin-small-left','uk-margin-small-top','uk-margin-small-bottom')
    rangMaxInput.oninput = function () {
    output.innerHTML = `max: ${this.value}`;
  }
  }


async function getObservationData(){
    fetch('./data/observations-Glycine.json')
  .then(response => response.json())
  .then(data => {
    for (let key in data) {
      console.log(key + ": " + data[key]);
    }
  })
  .catch(error => console.error('Error:', error)); 
}


window.onload = renderTraitsCheckbox();