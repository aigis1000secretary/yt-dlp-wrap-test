
const fs = require("fs");


(async () => {

    let files = [
        `2_.DELUTAYA-[zFPCBmyx8_c].live_chat.json`,
        `6_GW_rurudo_6-[GKhlado9gpg].live_chat.json`,
        `_-[HfdpuARKF6M].live_chat.json`
    ];

    let lines = [];
    for (let file of files) {
        if (!fs.existsSync(file)) { continue; }
        let buffer = (fs.readFileSync(file, 'utf8') || "").trim().split(/\r?\n/);
        lines = lines.concat(buffer);
    }

    for (let line of lines) {
        let chatItem = null;

        try {
            chatItem = JSON.parse(line);
        } catch (e) {
            console.log(`line parse error:`)
            console.log(e);
            continue;
        }

        let actions = chatItem.replayChatItemAction.actions[0];
        let item =
            actions.addChatItemAction?.item ||            // normal chat
            actions.addLiveChatTickerItemAction?.item ||  // super chat
            actions.addBannerToLiveChatCommand?.bannerRenderer.liveChatBannerRenderer.contents;     // banner
        let renderer = item?.liveChatTextMessageRenderer || item?.liveChatPaidMessageRenderer;
        // 'liveChatViewerEngagementMessageRendere', 'liveChatMembershipItemRenderer',
        // 'liveChatTickerSponsorItemRenderer',      'liveChatPaidMessageRenderer',
        // 'liveChatTickerPaidMessageItemRenderer',  'liveChatSponsorshipsGiftPurchaseAnnouncementRenderer',
        // 'liveChatPaidStickerRendere',             'liveChatSponsorshipsGiftRedemptionAnnouncementRenderer'
        if (!renderer) { continue; }
        // console.log(item)

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

        if (!superchat) { continue; }
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





    }



    console.log('result');

})();
