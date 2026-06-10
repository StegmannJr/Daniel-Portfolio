function ageCalculator(birth, id) {
    var dob = new Date(birth);

    var month_diff = Date.now() - dob.getTime();
    
    var age_dt = new Date(month_diff);
    
    var year = age_dt.getUTCFullYear();
    
    var age = Math.abs(year - 1970);
    
    const element = document.getElementById(id);
    element.innerText = age;
}

document.getElementById("currentYear").innerText = new Date().getFullYear();
ageCalculator("2008-10-16", "DanielAge");