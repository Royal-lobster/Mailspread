// get all the queries from the url and create an object
// with keys and values for each query
let queryString = window.location.search;
let queries = queryString.slice(1).split("&");
let queryObject = {};
queries.forEach((query) => {
  let key = query.split("=")[0];
  let value = query.split("=")[1];
  queryObject[key] = value;
});

// decode the values from base64 in queryObject
let decodedToAddress = atob(queryObject.toAddress);
let decodedSubject = atob(queryObject.subject);
let decodedBody = atob(queryObject.body);

console.log(decodedToAddress);
console.log(decodedSubject);
console.log(decodedBody);

// clean up all template tags in decodedBody of type {{key:value}} or {{key}}
// by lowercasing {{key}} and {{key:value}} and removing all spaces
let templateRegex = /\{\{(.*?)\}\}/g;
decodedBody = decodedBody.replace(templateRegex, (match, p1) => {
  return `{{${p1.toLowerCase().replace(/\s/g, "")}}}`;
});

// parse the decoded Body for template tags
let templateTags = decodedBody.match(templateRegex);
console.log(templateTags);

// for each template tag of form {{key:value}},
// create an object with key = key and value = value
let templateTagObjects = {};
templateTags?.forEach((templateTag) => {
  let key = templateTag.split(":")[0];
  let value = templateTag.split(":")[1] || "text";
  // remove the {{}} from the key and value using regex
  key = key?.replace(/\{\{|\}\}/g, "");
  value = value?.replace(/\{\{|\}\}/g, "");
  templateTagObjects[key] = value;
});
console.log(templateTagObjects);

// insert decodedSubject into the header
document.getElementById("subject").textContent = decodedSubject;
// create a html form in the DOM inside main tag
let form = document.createElement("form");
form.setAttribute("class", "form");
document.getElementById("card").appendChild(form);

// for each template tag, create a label and text input
// with the name of the key and value of the value
Object.keys(templateTagObjects)?.forEach((key) => {
  let label = document.createElement("label");
  let input = document.createElement("input");
  label.innerText = key.replace(/_/g, " ");
  label.style.textTransform = "capitalize";
  input.setAttribute("type", templateTagObjects[key]);
  input.setAttribute("name", key);
  input.setAttribute("required", "");
  input.setAttribute("placeholder", `Enter ${key.replace(/_/g, " ")}`);
  form.appendChild(label);
  form.appendChild(input);
});
// create a submit button
let submit = document.createElement("input");
submit.setAttribute("type", "submit");
submit.setAttribute("value", "Generate Template in your Email Client");
form.appendChild(submit);

// when the form is submitted prevent default
form.addEventListener("submit", (e) => {
  e.preventDefault();
  // get the values of the inputs
  let inputs = form.querySelectorAll("input");
  let values = {};
  inputs?.forEach((input) => {
    // if the input is date, convert it to a locale string
    if (input.type === "date") {
      values[input.name] = input.value.toLocaleString();
    } else {
      values[input.getAttribute("name")] = input.value;
    }
  });
  console.log(values);
  // replace the template tags in the body with the values
  let newBody = decodedBody;
  Object.keys(values)?.forEach((key) => {
    let value = values[key];
    let regex = new RegExp(`{{${key}(:.*?)?}}`, "g");
    newBody = newBody.replace(regex, value);
  });
  console.log(newBody);
  // create a mailto link with the new body, decodedToAddress,
  // decodedSubject by replacing newlines with %0D%0A , spaces with %20, tabs with %09,
  // and other special characters with %xx
  let mailto = `mailto:${decodedToAddress}?subject=${decodedSubject}&body=${newBody
    .replace(/\n/g, "%0D%0A")
    .replace(/ /g, "%20")
    .replace(/\t/g, "%09")
    .replace(/\+/g, "%2B")
    .replace(/\?/g, "%3F")
    .replace(/\=/g, "%3D")
    .replace(/\&/g, "%26")
    .replace(/\#/g, "%23")
    .replace(/\:/g, "%3A")
    .replace(/\;/g, "%3B")}`;
  console.log(mailto);
  // open the mailto link in the user's default email client
  window.open(mailto);
});
