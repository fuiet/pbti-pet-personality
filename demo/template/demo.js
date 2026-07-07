const data={
 company:'Superior Landscapes',
 location:'Dallas Texas',
 services:['Landscape Design','Maintenance','Outdoor Living']
};

document.getElementById('company').innerText=data.company;
document.getElementById('location').innerText=data.location;

data.services.forEach(item=>{
 const el=document.createElement('div');
 el.innerText=item;
 document.getElementById('services').appendChild(el);
});