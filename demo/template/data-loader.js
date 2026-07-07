async function loadCustomer(path){
 const response=await fetch(path);
 return await response.json();
}

loadCustomer('../../customers/superior-landscapes.json')
.then(data=>{
 const company=document.getElementById('company');
 const location=document.getElementById('location');
 const services=document.getElementById('services');

 if(company) company.innerText=data.companyName;
 if(location) location.innerText=data.location;

 if(services){
  data.services.forEach(service=>{
   const item=document.createElement('div');
   item.innerHTML='<h3>'+service+'</h3><p>Professional solutions designed for your property.</p>';
   services.appendChild(item);
  });
 }
});