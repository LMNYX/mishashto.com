var LOC = {};
var CURRENT_LANG = "jp";

window.onload = async () =>
{
    LOC = await getLocales();

    var userLang = navigator.language || navigator.userLanguage; 
    switch (userLang)
    {
        case "ja":
            CURRENT_LANG = "jp";
            break;
        case "en":
            CURRENT_LANG = "en";
            break;
        default:
            CURRENT_LANG = "en";
            break;
    }

    let navButtons = document.querySelectorAll(".navbar > a:not(.icon)");

    for (let i = 0; i < navButtons.length; i++)
    {
        navButtons[i].addEventListener("click", async (e) =>
        {
            e.preventDefault();
            await switchPage(e.target);
            console.log(1);
            return false;
        });
    }
    switchPage(navButtons[0]);
}

async function getLocales()
{
    let response = await fetch("./static/localization.json");
    let locales = await response.json();
    return locales;
}

async function switchPage(button)
{
    let navButtons = document.querySelectorAll(".navbar > a:not(.icon)");
    for (let i = 0; i < navButtons.length; i++)
        navButtons[i].classList.remove("active");
    button.classList.add("active");

    await anime({
        targets: "div.main",
        opacity: 0,
        duration: 1500
    });

    let link = button.getAttribute("data-link");
    
    let content = await getContent(link);
    await setContent(content);
}

async function getContent(link)
{
    let response = await fetch(`./static/contents/${link}.html`);
    let content = await response.text();
    return content;
}

async function setContent(content)
{
    let parser = new DOMParser();
    let doc = parser.parseFromString(content, "text/html");

    let translatableElements = doc.querySelectorAll("[data-translatable]");

    for (let i = 0; i < translatableElements.length; i++)
    {
        let innerHTML = translatableElements[i].innerHTML;
        let matches = innerHTML.match(/%(.+?)%/g);

        for (let j = 0; j < matches.length; j++)
        {
            let key = matches[j].replace(/%/g, "");
            let translation = LOC[CURRENT_LANG][key];
            innerHTML = innerHTML.replace(matches[j], translation);
        }

        translatableElements[i].innerHTML = innerHTML;
    }

    content = doc.querySelector("body").innerHTML;

    document.querySelector("main > div.main").innerHTML = content;

    await anime({
        targets: "div.main",
        opacity: 1,
        duration: 1500
    });
}