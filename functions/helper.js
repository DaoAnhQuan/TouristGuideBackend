exports.getDateString = ()=>{
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = date.getMonth();
    const day = date.getDate();
    const hour = date.getHours();
    var minute = date.getMinutes();
    const monthMap = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const dayMap= ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18",
                "19","20","21","22","23","24","25","26","27","28","29","30","31"];
    minute = minute<10?dayMap[minute]:minute.toString();
    const dateString = monthMap[month]+" "+dayMap[day]+", "+ year+" at "+dayMap[hour]+":"+minute;
    return dateString;
}
