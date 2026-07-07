document.addEventListener('DOMContentLoaded',()=>{
 const button=document.querySelector('button');
 button.addEventListener('click',()=>{
  const company=document.querySelectorAll('input')[0].value || 'demo-company';
  const industry=document.querySelector('select').value;
  const style=document.querySelectorAll('select')[1].value;

  const slug=company.toLowerCase().replace(/\s+/g,'-');

  const demo={
   companyName:company,
   industry:industry,
   style:style,
   url:'/demo/'+slug
  };

  localStorage.setItem('clearpeak_demo',JSON.stringify(demo));

  alert('Demo created: '+demo.url);
 });
});