const templateForm = document.getElementById("templateForm");

templateForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const toAddress = templateForm.elements["toAddress"].value;
  const subject = templateForm.elements["subject"].value;
  const body = templateForm.elements["body"].value;

  // check if toAddress is valid
  let emails = toAddress.replace(/\s/g, "").split(",");
  let isToAddressValid = true;
  let regex =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  for (var i = 0; i < emails.length; i++) {
    if (emails[i] == "" || !regex.test(emails[i])) {
      isToAddressValid = false;
    }
  }

  if (isToAddressValid) {
    //encode toAddress, subject, body to base64 each
    const EncodedToAddress = btoa(toAddress);
    const EncodedSubject = btoa(subject);
    const EncodedBody = btoa(body);

    let createAndCopyURL = async () => {
      //create a new URL at address /send.html
      const url = `${window.location.origin}/send.html?toAddress=${EncodedToAddress}&subject=${EncodedSubject}&body=${EncodedBody}`;

      //create a tiny url using tinyurl.com
      fetch(`https://tinyurl.com/create.php?url=${url}`)
        .then((res) => navigator.clipboard.writeText(res.text()))
        .catch(() => navigator.clipboard.writeText(url));

      //display a success message
      Toastify({
        text: "Copied to clipboard",
        style: {
          background: "linear-gradient(to right, #1ab3e6, #167D99)",
        },
      }).showToast();
    };
    createAndCopyURL();
  } else {
    if (!isToAddressValid) {
      document.getElementById("toAddress").setAttribute("aria-invalid", "true");
      Toastify({
        text: "Invalid To Address",
        style: {
          background: "red",
        },
      }).showToast();
    }
  }
});

const closeModal = () => {
  const modal = document.getElementById("modal");
  modal.removeAttribute("open");
};
const openModal = () => {
  const modal = document.getElementById("modal");
  modal.setAttribute("open", "");
};
