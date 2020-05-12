const axios = require("axios");
const mecab = require("mecab-ya");
require("dotenv").config();

//형태소 분석 - 명사 구하기
exports.getNouns = (comment) => {
    return new Promise((resolve, reject) => {
        mecab.nouns(comment, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

// 한글 제외 특수문자, 언어 등 공백처리 후 문자열로 합침
exports.refineData = (comments) => {
    const pattern = /[^(가-힣)]|[()]/gi; // 완성된 한글 글자만 남기는 정규식
    const result = comments.reduce((acc, curr) => {
        const data = curr.replace(pattern, " ");
        return acc.concat(` ${data}`);
    }, "");

    return result;
};

//단어 빈도수구하기
exports.getNounsFrequency = (nounsArr) => {
    const nounsFrequent = nounsArr.reduce((acc, curr) => {
        if (acc.hasOwnProperty(curr)) {
            return {
                ...acc,
                [curr]: acc[curr] + 1,
            };
        } else {
            return {
                ...acc,
                [curr]: 1,
            };
        }
    }, {});
    return nounsFrequent;
};

//내림 차순으로 정렬 후 100개까지만 자르기
exports.sortByCount = (nouns) => {
    let sortable = [];
    for (const noun in nouns) {
        sortable.push([noun, nouns[noun]]);
    }
    sortable.sort((a, b) => b[1] - a[1]);
    if (sortable.length >= 100) {
        return sortable.slice(0, 100);
    } else {
        return sortable;
    }
};

//댓글 가져오기
exports.getComments = async (videoId) => {
    const URL = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=100&textFormat=plainText&videoId=${videoId}&key=${process.env.GOOGLE_API_KEY}`;
    try {
        const response = await axios.get(URL);
        const items = response.data.items;
        const comments = items.reduce((acc, curr, i) => {
            const comment = curr.snippet.topLevelComment.snippet.textOriginal;
            return [...acc, comment];
        }, []);

        return comments;
    } catch (e) {
        console.log(e);
        return [];
    }
};
