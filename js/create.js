const templateForm = document.getElementById("templateForm");
const submitBtn = document.getElementById("submitBtn");
const bodyTextArea = document.getElementById("bodyTextArea");

// auto close baraces entered in textarea
const closeChars = new Map([["{", "}"]]);
bodyTextArea.addEventListener("keyup", (e) => {
  if (e.keyCode == 219) {
    const pos = e.target.selectionStart;
    const val = [...e.target.value];
    const char = val.slice(pos - 1, pos)[0];
    const closeChar = closeChars.get(char);
    if (closeChar) {
      val.splice(pos, 0, closeChar);
      e.target.value = val.join("");
      e.target.selectionEnd = pos;
    }
  }
});

// form submit function
templateForm.addEventListener("submit", function (e) {
  submitBtn.setAttribute("aria-busy", "true");
  submitBtn.textContent = "Generating...";

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

    let copyAndEndLoading = () => {
      Toastify({
        text: "Copied to clipboard",
        style: {
          background: "linear-gradient(to right, #1ab3e6, #167D99)",
        },
      }).showToast();
      submitBtn.setAttribute("aria-busy", "");
      submitBtn.textContent = "Generate link";
    };
    let createAndCopyURL = async () => {
      //create a new URL at address /send.html
      const url = `${window.location.origin}/send.html?toAddress=${EncodedToAddress}&subject=${EncodedSubject}&body=${EncodedBody}`;

      //create a tiny url using tinyurl.com
      const tinyUrlRes = await fetch(
        `https://tinyurl.com/api-create.php?url=${url}`,
        {
          referrerPolicy: "strict-origin-when-cross-origin",
          body: null,
          method: "GET",
          mode: "cors",
          credentials: "omit",
        }
      );
      navigator.clipboard.writeText(await tinyUrlRes.text());
      copyAndEndLoading();
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
    submitBtn.setAttribute("aria-busy", "");
  }
});

// modal open and close functions
const closeModal = () => {
  const modal = document.getElementById("modal");
  modal.removeAttribute("open");
};
const openModal = () => {
  const modal = document.getElementById("modal");
  modal.setAttribute("open", "");
};

// textarea template highlighting
$(".body-textarea").highlightWithinTextarea({
  highlight: [
    {
      highlight: /\{\{(.*?)\}\}/g,
      className: "blue-highlight",
    },
    {
      highlight: /:(.*?)}/g,
      className: "darker-highlight",
    },
    {
      highlight: /ba(na)*/gi,
      className: "yellow",
    },
  ],
});
autosize($("textarea"));

// regex to match value part in {{key:value}} starting from : to end }
const regex = /\{\{(.*?)\}\}/g;
