async function loadCustomer(path){
 const response=await fetch(path);
 return await response.json();
}

loadCustomer('../../customers/superior-landscapes.json')
.then(data=>{
 const company=document.getElementById('company');
 const location=document.getElementById('location');
 if(company) company.innerText=data.companyName;
 if(location) location.innerText=data.location;
});
