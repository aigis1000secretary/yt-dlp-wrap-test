// const YoutubeDlWrap = require("youtube-dl-wrap");
const { default: YTDlpWrap } = require("yt-dlp-wrap");
const fs = require("fs");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// TODO
// https://community.fly.io/t/how-can-i-use-ffmpeg-on-fly-io/4366


/*
(async () => {
    let filename = `SEKIRO_05_VS-[iUb5Ma5Xmro].live_chat.json`;
    // let filename = `Megaman_Zero_Zero_to_Hero-[-MMMAGVcELI].live_chat.json`;

    let buffer = (fs.readFileSync(`${filename}.part`, 'utf8') || "").trim().split('\n');

    let results = [];
    for (let i in buffer) {
        buffer[i] = buffer[i].replace(/"clickTrackingParams": "[^"]+", /g, "");
        buffer[i] = buffer[i].replace(/"trackingParams": "[^"]+", /g, "");
        buffer[i] = buffer[i].replace(/, "trackingParams": "[^"]+"/g, "");
        // if (buffer[i].includes('liveChatViewerEngagementMessageRenderer')) { buffer[i] = ""; continue; }
    }
    buffer = buffer.filter((ele, i, arr) => { return arr.indexOf(ele) === i; });

    for (let i in buffer) {
        let chatItem;
        try {
            chatItem = JSON.parse(buffer[i]);
        } catch (e) { break; }

        let item = chatItem.replayChatItemAction.actions[0].addChatItemAction?.item;
        if (!item || item.liveChatViewerEngagementMessageRenderer) { continue; }

        let data =
            item.liveChatMembershipItemRenderer ||  // join
            item.liveChatTextMessageRenderer ||     // chat
            item.liveChatPaidMessageRenderer ||     // super chat
            item.liveChatSponsorshipsGiftPurchaseAnnouncementRenderer ||    // gift
            item.liveChatSponsorshipsGiftRedemptionAnnouncementRenderer;    // gifted

        if (data) {
            if (data.header?.liveChatSponsorshipsHeaderRenderer) {
                data = Object.assign(data, data.header.liveChatSponsorshipsHeaderRenderer);
            }

            let id = data.id || null;
            let authorName = data.authorName?.simpleText || '';
            let authorPhoto = data.authorPhoto?.thumbnails || '';
            let authorExternalChannelId = data.authorExternalChannelId || '';
            let purchaseAmountText = data.purchaseAmountText?.simpleText || '';

            let message = '', authorBadges = null;

            // messages
            let runs;
            runs = data.headerPrimaryText?.runs || data.headerSubtext?.runs || data.primaryText?.runs;
            if (runs && Array.isArray(runs)) {
                for (let { text } of runs) {
                    if (text) { message += text; }
                }
            }
            if (item.liveChatMembershipItemRenderer && data.message) { message += ': '; }
            runs = data.message?.runs;
            if (runs && Array.isArray(runs)) {
                for (let { text } of runs) {
                    if (text) { message += text; }
                }
            }

            // badges
            authorBadges = item.liveChatMembershipItemRenderer ? null : data.authorBadges;
            if (authorBadges && Array.isArray(authorBadges)) {
                for (let badges of data.authorBadges) {
                    authorBadges = badges.liveChatAuthorBadgeRenderer?.tooltip || authorBadges;
                }
            }

            let livechat = { id, authorBadges, authorName, authorPhoto, authorExternalChannelId, message };

            // show data
            if (!item.liveChatTextMessageRenderer || authorBadges == "Moderator") {
                console.log(`[LiveChat]`,
                    authorBadges ? `<${authorBadges}> ${authorName}` : authorName,
                    message,
                    authorPhoto ? '' : '[-] Photo',
                    authorExternalChannelId ? '' : '[-] cID');
            }
        }

        let res = Object.keys(item)[0];
        if (!results.includes(res)) { results.push(res); }
    }
    console.log(JSON.stringify(results, null, 2));

    buffer.sort();
    // fs.writeFileSync(filename, buffer.join('\n'));
})();//*/


// /*
(async () => {
    // Download the youtube-dl binary for the given version and platform to the provided path.
    // By default the latest version will be downloaded to "./youtube-dl" and platform = os.platform().
    // await YoutubeDlWrap.downloadFromGithub('youtube-dl', '2023.03.04.1', '');
    await YTDlpWrap.downloadFromGithub().catch(() => { });
    await sleep(100);

    //Init an instance with a given binary path.
    //If none is provided "youtube-dl" will be used as command.
    const ytDlpWrap = new YTDlpWrap();

    const vID = process.argv[2] || `Vx1K89idggs`;
    // const vID = process.argv[2] || `iUb5Ma5Xmro`;
    // const vID = process.argv[2] || `GbIIr3waYzI`;

    // /*
    let livechatRawPool = [];
    let interval = setInterval(
        () => {
            // console.log(`[Interval] livechatPool.length = `, livechatPool.length);
            for (let livechatRaw of livechatRawPool) {
                let { filename, indexOfLine } = livechatRaw;

                // check file exist
                if (!fs.existsSync(`${filename}.part`)) { continue; }
                // file buffer
                let buffer = (fs.readFileSync(`${filename}.part`, 'utf8') || "").trim().split('\n');

                for (let i = indexOfLine; i < buffer.length; ++i) {

                    // if (i % 1000 == 0 || i == (buffer.length - 1)) { console.log(`[Interval] buffer Line ${i + 1} /${buffer.length}`); }

                    // get livechat raw line
                    let line = buffer[i];

                    // line to json
                    let chatItem;
                    try {
                        chatItem = JSON.parse(line);
                    } catch (e) { break; }

                    ++livechatRaw.indexOfLine;

                    // get livechat object
                    try {
                        // get main object
                        let actions = chatItem.replayChatItemAction.actions[0];
                        let item =
                            actions.addChatItemAction?.item ||            // normal chat
                            actions.addLiveChatTickerItemAction?.item ||  // super chat
                            actions.addBannerToLiveChatCommand?.bannerRenderer.liveChatBannerRenderer.contents;     // banner

                        // check event type
                        let renderer = item?.liveChatTextMessageRenderer;
                        // 'liveChatViewerEngagementMessageRendere', 'liveChatMembershipItemRenderer',
                        // 'liveChatTickerSponsorItemRenderer',      'liveChatPaidMessageRenderer',
                        // 'liveChatTickerPaidMessageItemRenderer',  'liveChatSponsorshipsGiftPurchaseAnnouncementRenderer',
                        // 'liveChatPaidStickerRendere',             'liveChatSponsorshipsGiftRedemptionAnnouncementRenderer'
                        if (!renderer) { continue; }


                        // set result
                        let auDetails = {
                            channelId: renderer.authorExternalChannelId,
                            channelUrl: `http://www.youtube.com/channel/${renderer.authorExternalChannelId}`,
                            displayName: renderer.authorName.simpleText,
                            isChatModerator: false, isChatOwner: false,
                            isChatSponsor: false, isVerified: false,
                            sponsorLevel: 0,
                            profileImageUrl: ''
                        }
                        // user level
                        let authorBadges = renderer.authorBadges || [];
                        for (let badge of authorBadges) {
                            let tooltip = badge?.liveChatAuthorBadgeRenderer.tooltip;

                            if (tooltip.includes('ember')) {
                                auDetails.isChatSponsor = true;
                                switch (tooltip) {
                                    case 'New member': { auDetails.sponsorLevel = 1; } break;
                                    case 'Member (1 month)': { auDetails.sponsorLevel = 2; } break;
                                    case 'Member (2 months)': { auDetails.sponsorLevel = 3; } break;
                                    case 'Member (6 months)': { auDetails.sponsorLevel = 4; } break;
                                    case 'Member (1 year)': { auDetails.sponsorLevel = 5; } break;
                                    case 'Member (2 years)': { auDetails.sponsorLevel = 6; } break;
                                    default: {
                                        auDetails.sponsorLevel = -1;
                                        console.log(tooltip)
                                    } break;
                                }
                            }
                            else if (tooltip == 'Verified') { auDetails.isVerified = true; }
                            else if (tooltip == 'Moderator') { auDetails.isChatModerator = true; }
                            else if (tooltip == 'Owner') { auDetails.isChatOwner = true; }
                        }
                        // user icon
                        let thumbnails = renderer.authorPhoto?.thumbnails || [];
                        for (let icon of thumbnails) {
                            auDetails.profileImageUrl = icon.url;
                        }
                        // message
                        let runs = renderer.message?.runs || [];
                        let message = '';
                        for (let { text, emoji } of runs) {
                            if (text) { message += text; }
                            if (emoji) {
                                if (emoji.shortcuts) { message += ` ${emoji.shortcuts.pop()} `; }
                                else { message += emoji.image.accessibility.accessibilityData.label; }
                            }
                        }
                        // SC
                        let superchat = renderer.purchaseAmountText?.simpleText || '';

                        console.log(`[LiveChat]`,
                            // (auDetails.isChatModerator ? '🔧' : '　'),
                            // (auDetails.isChatOwner ? '⭐' : '　'),
                            // (auDetails.isVerified ? '✔️' : '　'),
                            // (auDetails.isChatSponsor ? '🤝' : '　'),
                            (auDetails.isChatModerator ? 'T' : '_'),
                            (auDetails.isChatOwner ? 'O' : '_'),
                            (auDetails.isVerified ? 'V' : '_'),
                            (auDetails.isChatSponsor ? 'S' : '_'),
                            `<${auDetails.displayName}>`,
                            superchat,
                            message,
                            (auDetails.profileImageUrl ? '' : '[-] Photo'),
                            (auDetails.channelId ? '' : '[-] cID'));

                    } catch (e) { console.log(e); break; }
                }
            }
        }, 500);

    let ytDlpEventEmitter = ytDlpWrap
        .exec([
            `https://www.youtube.com/watch?v=${vID}`,
            '--skip-download', '--restrict-filenames',
            '--write-subs', '--sub-langs', 'live_chat',
            // '-f', 'best',
            // '-o', 'output.mp4',
            '--cookies', 'cookies.txt'
        ])
        .on('progress', (progress) =>
            console.log(`[Progress]`,
                progress.percent, progress.totalSize,
                progress.currentSpeed, progress.eta
            )
        )
        .on('ytDlpEvent', async (eventType, eventData) => {
            if (eventType != 'download' || !eventData.includes('frag')) {
                console.log(`[${eventType}]`, eventData);
            }

            if (eventType == 'download' && !eventData.includes('frag') &&
                /Destination:\s*([\S\s]+\.live_chat\.json)/.test(eventData)
            ) {
                let [, filename] = eventData.match(/Destination:\s*([\S\s]+\.live_chat\.json)/);
                if (!livechatRawPool.find((livechat) => livechat.vID == vID)) {
                    livechatRawPool.push({ vID, filename, indexOfLine: 0 });
                }
            }
        })
        .on('error', (error) => {
            clearInterval(interval);
            console.error(error);
            if (error.toString().includes('members-only')) { console.log('members-only') }
        })
        .on('close', () => {
            if (!livechatRawPool.find((livechat) => livechat.vID == vID)) {
                livechatRawPool = livechatRawPool.filter((ele, i, arr) => { return livechat.vID != vID; });
            }
            clearInterval(interval);
            console.log('all done');
        }); //*/













    console.log();
})();//*/






