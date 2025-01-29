
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
    let sliderbox = document.getElementById(`${id}-slider`)
    let valuebox = document.getElementById(`${id}-value-output`)
    let selectbox = document.getElementById(`${id}-select`);

    if(checkedbox.checked){
      renderValueSlider(min, max, id, arr)
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

  function renderValueSlider(min, max, id, data){

    if(min !== Infinity && max !== 0) {
      console.log("renderValueSlider id:", id)
      const container = document.getElementById(`${id}-value-slider`)
      console.log("container: ",container)
      
      const slider =  document.createElement('input')
       
      slider.setAttribute("step", "0.1")
          slider.type = 'range'
          slider.id = id + '-slider'
          slider.min = min
          slider.max = max
          slider.defaultValue = min;
          slider.classList.add('uk-margin-medium-left','uk-margin-small-top','uk-margin-small-bottom')
          
          const valueOutput = document.createElement('span')
          container.appendChild(slider)
          container.appendChild(valueOutput)
  
          valueOutput.id = id + '-value-output';
          let rangslider = document.getElementById(`${id}-slider`)
          let output = document.getElementById(`${id}-value-output`);
              output.innerHTML = min;
            output.classList.add('uk-margin-small-left','uk-margin-small-top','uk-margin-small-bottom')
            rangslider.oninput = function () {
            output.innerHTML = this.value;
          }
    }else {

      // render select dropdown
      const container = document.getElementById(`${id}-value-slider`)
      
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
        
        // render array in as select options
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
                sliderContainer.id = `${item.traitDbId}-value-slider`;
                sliderContainer.classList.add('uk-flex');

                traitContainer.style.minWidth = "380px";
                traitContainer.append(traitItemCheckbox, traitLabel, document.createElement('br'), sliderContainer);
            });
        });
    } catch (error) {
        console.error('Error:', error);
    }
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