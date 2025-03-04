"use strict";

class MarkCodeLineManager {
    constructor() {
        this.lineElement = null;
        this.lineCodeBlock = null;
        this.className = "hll";
    }
    setElement() {
        if (this.lineElement) {
            this.unsetElement();
        }

        let hash = window.location.hash;

        if (hash === "" || !hash.includes("example")) {
            // gmcDebug(`⏩ hash is empty`);
            return;
        }

        this.lineElement = document.querySelector(hash);

        if (!this.lineElement) {
            return;
        }

        this.lineCodeBlock = this.lineElement.closest("code");

        gmcAddClassToElement(this.className, this.lineElement, hash);
        this.showHiddenMarkedLine();
        this.setSpanWidth();
    }
    unsetElement() {
        if (!this.lineElement) {
            return;
        }
        this.lineElement.classList.remove(this.className);
        this.unsetSpanWidth();
        this.lineElement = null;
        this.lineCodeBlock = null;
    }
    showHiddenMarkedLine() {
        let tabbedBlock = this.lineElement.closest(".tabbed-block");

        if (!tabbedBlock || window.getComputedStyle(tabbedBlock).display !== "none") {
            return;
        }

        let tabbedContent = tabbedBlock.parentElement;
        let childBlocks = tabbedContent.children;
        let blockIndex;

        for (blockIndex = 0; blockIndex < childBlocks.length; blockIndex++) {
            if (childBlocks[blockIndex] === tabbedBlock) {
                break;
            }
        }

        let blockInputElement = tabbedContent.parentElement.children[blockIndex];
        blockInputElement.click();
    }
    setSpanWidth() {
        if (!this.lineCodeBlock) {
            return;
        }
        let children = this.lineCodeBlock.childNodes;
        let max = 0;
        for (let child of children) {
            let current = child.innerText.length;
            if (current > max) {
                max = current;
            }
        }
        for (let child of children) {
            // child.setAttribute("style", `min-width: ${max * 8.5}px;`)
            child.setAttribute("style", `min-width: ${max * 0.65}em;`)
        }
    }
    unsetSpanWidth() {
        if (!this.lineCodeBlock) {
            return;
        }
        let children = this.lineCodeBlock.childNodes;
        for (let child of children) {
            child.removeAttribute("style");
        }
    }
}

let gGMC_DEBUG = window.location.hostname === "127.0.0.1";
let gMarkCodeLineManager = new MarkCodeLineManager();

window.addEventListener("DOMContentLoaded", _ => {
    gMarkCodeLineManager.setElement();
    gmcExpandNavigation();
    gmcExternalLinks();
    gmc404Redirect();
});

window.addEventListener("hashchange", _ => {
    gMarkCodeLineManager.setElement();
})

function gmcAddClassToElement(className, element, elementName) {
    if (element.classList.contains(className)) {
        // gmcDebug(`⏩ Class '${className}' already present for ${elementName}`);
        return;
    }

    element.classList.add(className);
    // gmcDebug(`✅ Added '${className}' class to ${elementName}`);
}

function gmcExternalLinks() {
    const hostname = window.location.hostname;
    const domainParts = hostname.split('.');
    const githubId = domainParts[1] === "github" ? domainParts[0] : "gothic-modding-community";
    const repoUrl = `github.com/${githubId}`;

    // Regex to match urls starting with
    // https://$hostname
    // https://$repoUrl
    const regex = new RegExp(`^(?:https?:\/\/)?(${hostname}|${repoUrl})`);
    const anchors = document.querySelectorAll(".md-content a");
    const className = "external-link";

    anchors.forEach( a => {
        if (a.href === "" || regex.test(a.href)) {
            // gmcDebug(`⏩ Regex matched for ${a.href} or is empty`);
            return;
        }

        a.setAttribute("target", "_blank");

        gmcAddClassToElement(className, a, a.href);
    });
}

function gmcExpandNavigation() {

    if (window.matchMedia("(max-width: 76.1875em)").matches) {
        // gmcDebug(`⏩ mobile doesn't expand`);
        return;
    }

    const activeNav = document.querySelector(".md-nav__link--active");

    if (activeNav === null || activeNav.parentElement === null) {
        return;
    }

    const children = activeNav.parentElement.querySelector("nav > ul").children;

    for (let i = 0; i < children.length; i++) {
        const toggle = children[i].querySelector('input[type="checkbox"]');

        if (!toggle) {
            // gmcDebug(`⏩ toggle not present`);
            continue;
        }

        if (toggle.checked) {
            // gmcDebug(`⏩ '${toggle.id}' already checked`);
            continue;
        }

        toggle.checked = true;
        // gmcDebug(`✅ Expanded '${toggle.id}'`);
    }
}

function gmc404Redirect() {
    const header = document.querySelector(".md-content h1");

    if (header === null) {
        return;
    }

    const href = window.location.href;

    if (header.innerHTML.includes("404") && href !== href.toLowerCase()) {
        window.location.replace(href.toLowerCase());
    }
}

function gmcDebug(message) {
    if (gGMC_DEBUG)
        console.debug(message);
}