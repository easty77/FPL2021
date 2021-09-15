const someCommonValues = ['common', 'values'];
 
export const capitalizeColumnName = (strColName)=>{
    var aParts = strColName.split("_");
    var aNewParts = [];
    aParts.forEach(element => aNewParts.push(element[0].toUpperCase() + element.slice(1)));
    return aNewParts.join(" ");
}

export const fieldValueConstant = (rows, field)=>{
    var value = rows[0][field];
    const found = rows.find(element => element[field] !== value);
    return found === undefined;
}

