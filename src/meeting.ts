import * as request from 'request';

const targetUrl = /domainOwnerJoinLauncherUrl\s*=\s*"([^"]*)/;

function extractJoinUrl(body: string) {
    const match = targetUrl.exec(body);
    if (match) {
        return match[1];
    }
}

/**
 * Resolve a meeting URL to a joinable endpoint.
 */
export function resolveJoinUrl(meetingUrl: string, callback: (joinUrl: string) => void) {
    request.get({
        url: meetingUrl,
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml',
            // UA needs to be present for the Skype meeting server to respond
            'User-Agent': 'Skype Client'
        }
    }, (error, response, body) => {
        error
            ? callback(meetingUrl)
            : callback(extractJoinUrl(body) || meetingUrl);
    });
}
