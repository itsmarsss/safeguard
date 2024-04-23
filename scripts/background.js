chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.html) {
        sendResponse({ message: main(sender.tab.url, request.html) });
    }
});



const blacklistDomains = [".to", ".tk"];
const domainTypeScore = {
    ".edu": 200,
    ".gov": 200,
    ".org": 50,
    ".com": 30,
    ".ca": 30,
};

const userEditableSources = [
    'wikipedia.org', 'quora.com', 'reddit.com', 'linkdin.com', 'facebook.com', 'wiki', 'forum'
];

const highTrustDomains = [
    'nytimes.com', 'bbc.com', 'cnn.com', 'theguardian.com',
    'washingtonpost.com', 'npr.org', 'harvard.edu', 'stanford.edu',
    'jstor.org', 'springer.com', 'elsevier.com', 'nature.com', 'usa.gov',
    'gov.uk', 'europa.eu', 'who.int', 'cdc.gov', 'redcross.org', 'amnesty.org',
    'wwf.org', 'msf.org', 'wsj.com', 'ft.com', 'bloomberg.com',
    'economist.com', 'mayoclinic.org', 'nih.gov', 'cancer.org', 'ieee.org',
    'acm.org', 'mit.edu', 'britannica', 'ap.org', 'reuters.com', 'pbs.org',
    'nationalgeographic.com', 'scientificamerican.com', 'usatoday.com',
    'time.com', 'forbes.com', 'newyorker.com', 'usatoday.com', 'businessinsider.com',
    'apnews.com', 'theatlantic.com', 'fortune.com', 'vox.com', 'axios.com',
    'sciencemag.org', 'nationalacademies.org', 'guardian.co.uk', 'arstechnica.com',
    'usatoday.com', 'abcnews.go.com', 'newsweek.com', 'cnbc.com', 'bostonglobe.com',
    'chicagotribune.com', 'latimes.com', 'nasa.gov', 'space.com', 'wired.com',
    'pbs.org', 'smithsonianmag.com', 'aljazeera.com', 'euronews.com',
    'apmreports.org', 'apnews.com', 'cbsnews.com', 'usatoday.com', 'politico.com',
    'abc.net.au', 'cbc.ca', 'sky.com', 'independent.co.uk', 'axios.com',
    'thetimes.co.uk', 'usatoday.com', 'huffpost.com', 'technologyreview.com',
    'newscientist.com', 'theconversation.com', 'sciencedaily.com',
    'livescience.com', 'apnews.com', 'cbsnews.com', 'usatoday.com', 'nbcnews.com',
    'nationalpost.com', 'usatoday.com', 'cia.gov'
];

function main(url, html) {
    if (!url) {
        return {
            domainScore: 0,
            contentScore: 0,
            seScore: 0
        };
    }

    if (!validateUrl(url)) {
        return {
            domainScore: 0,
            contentScore: 0,
            seScore: 0
        };
    }

    if (userEditableSources.some((source) => url.includes(source))) {
        return {
            domainScore: 0,
            contentScore: 0,
            seScore: 0
        };
    }

    const { domainScore, isBlacklisted } = analyzeDomain(url);
    if (isBlacklisted) {
        return {
            domainScore: 0,
            contentScore: 0,
            seScore: 0
        };
    }

    const contentScore = analyzeContent(html);

    return {
        domainScore: domainScore,
        contentScore: contentScore,
        seScore: 100,
    }
}

function validateUrl(url) {
    const pattern = new RegExp(
        "^(https?:\\/\\/)?" +
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|localhost)" +
        "(:\\d{1,5})?" +
        "([/?#][^\\s]*)?$",
        "i"
    );
    return pattern.test(url);
}

function analyzeDomain(url) {
    let score = url.startsWith("https://") ? 25 : 0;
    const hostname = url.split("/")[2];

    const isBlacklisted = blacklistDomains.some((black) => hostname.includes(black));

    for (const [dt, dtScore] of Object.entries(domainTypeScore)) {
        if (hostname.endsWith(dt)) {
            score += dtScore;
            break;
        }
    }

    if (highTrustDomains.includes(hostname)) {
        score = 100;
    }

    return { domainScore: score, isBlacklisted };
}

function analyzeContent(html) {
    const contentInfo = {};
    let score = 0;

    const authorSelectors = [
        { name: "meta", attr: "name", value: /author|writer|creator/i },
        { name: "div", attr: "class", value: /author|writer|creator|byline/i },
        { name: "span", attr: "class", value: /author-name|byline/i },
        { name: "a", attr: "class", value: /byline-name/i },
    ];
    const dateSelectors = [
        { name: "meta", attr: "name", value: /date|published/i },
        { name: "time" },
        { name: "span", attr: "class", value: /date-published|published-date/i },
    ];

    function extractInfo(html, selectors, isDate = false) {
        let content = "";
        for (const selector of selectors) {
            const regex = new RegExp(`<${selector.name}[^>]*?${selector.attr ? `${selector.attr}="[^"]*?"` : ""}[^>]*?>(.*?)<\/${selector.name}>`, "i");
            const match = html.match(regex);
            if (match && match[1]) {
                content = match[1];
                break;
            }
        }
        if (isDate) {
            const date = parseDate(content);
            return date ? date : "Not specified";
        }
        return content.trim();
    }

    function parseDate(dateStr) {
        const dateFormats = [
            /\d{4}-\d{2}-\d{2}/,
            /\d{2}-\d{2}-\d{4}/,
            /\d{2}\/\d{2}\/\d{4}/,
            /\d{4}\/\d{2}\/\d{2}/,
            /(\w+) \d{2}, \d{4}/,
            /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
        ];

        for (const format of dateFormats) {
            const match = dateStr.match(format);
            if (match) {
                return match[0];
            }
        }

        return null;
    }

    contentInfo.author = extractInfo(html, authorSelectors);
    contentInfo.date = extractInfo(html, dateSelectors, true);
    score = calculateScore(contentInfo, html);
    return score;
}

function calculateScore(contentInfo) {
    let score = 0;
    const currentYear = new Date().getFullYear();

    if (contentInfo.date !== "Not specified") {
        const yearPublished = new Date(contentInfo.date).getFullYear();
        score += Math.max(50 - 3 * (currentYear - yearPublished), 0);
    }

    score += contentInfo.author ? 50 : 0;

    return score;
}

function printResult(url, score, category) {
    console.log(`URL analyzed: ${url}`);
    console.log(`Final Score: ${score.toFixed(2)}`);
    console.log(`Category: ${category}`);
}
