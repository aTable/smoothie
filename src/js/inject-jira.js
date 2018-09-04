var config = {
    issueKeyPrefix: '',
    issueKeySuffix: ' ',
    emphasiseTicketsWithWorkflowName: 'awaiting',
};

function init() {
    api.registerActions();
    api.emphasiseTickets();
}

var api = {
    // emphasis tickets on the board
    emphasiseTickets: function () {
        helpers.checkUntil(function () {
            return document.querySelector('#ghx-column-headers li') && document.querySelectorAll('.ghx-column .ghx-wrap-issue');
        }, 500).then(function () {

            var columns = document.querySelectorAll('#ghx-column-headers li')
            columns.forEach(col => {
                var heading = col.querySelector('h2');
                var title = heading.getAttribute('title');

                if (title.toLowerCase().indexOf(config.emphasiseTicketsWithWorkflowName.toLowerCase()) === -1) {
                    return;
                }

                var columnId = col.getAttribute('data-id');
                var ticketsInColumn = document.querySelectorAll('li.ghx-column[data-column-id="' + columnId + '"] [data-issue-key]');
                ticketsInColumn.forEach(x => {
                    x.style.backgroundColor = 'cadetblue';
                });
            });

        });
    },
    // binds interactions
    registerActions: function () {
        var note = document.querySelector('#note');
        note.addEventListener('click', actions.noteClick);
    },
};

var helpers = {
    // basic html templating
    htmlStringToElement: function (html) {
        var template = document.createElement('template');
        template.innerHTML = html;
        return template.content.firstChild;
    },
    // basic html templating
    htmlStringToElements: function (html) {
        var template = document.createElement('template');
        template.innerHTML = html;
        return template.content.childNodes;
    },
    // copies the currently highlighted text to the clipboard
    copyHighlightedText: function () {
        return document.execCommand('copy');
    },
    // gets the issue key on the page supporting 2 view modes (individual ticket and list modes)
    getIssueKeyEl: function () {
        if (document.querySelector('#key-val')) {
            // viewing a specific ticket full page e.g. you.atlassian.net/browse/ABC-123
            return document.querySelector('#key-val');
        } else if (document.querySelector('#issuekey-val')) {
            // list mode viewing a filter and selecting one opens a sidebar component of the ticket
            return document.querySelector('#issuekey-val');
        }
        throw new Error('unsupported issue key dom location');
    },
    checkUntil: function (conditionFunc, millisecondsInterval) {
        var retryCount = 0;
        var retryCountLimit = 100;

        var promise = new Promise((resolve, reject) => {
            var timer = setInterval(function () {
                if (conditionFunc()) {
                    console.log('predicate succeeded');
                    clearInterval(timer);
                    resolve();
                    return;
                }
                retryCount++;
                console.log('retry count', retryCount);
                if (retryCount >= retryCountLimit) {
                    clearInterval(timer);
                    reject("retry count exceeded");
                    console.error('retry count exceeded');
                }
            }, millisecondsInterval);
        });

        return promise;
    }
};

// page interactions
var actions = {
    noteClick: function () {
        var issueKey = helpers.getIssueKeyEl().textContent;
        var summary = document.querySelector('#summary-val').textContent;
        var note = document.querySelector('#note');
        note.value = config.issueKeyPrefix + issueKey + config.issueKeySuffix + summary;
        note.select();
        helpers.copyHighlightedText();
    }
};



// ********************** INIT *************************//
var containerHtml = '<div id="smoothie"><input id="note" type="text" value="" /></div>';
var container = helpers.htmlStringToElement(containerHtml);
document.body.appendChild(container);
init();
