// ==UserScript==
// @name               hololyzer Sort Tool
// @name:zh            hololyzer 排序工具
// @name:zh-TW         hololyzer 排序工具
// @name:zh-CN         hololyzer 排序工具
// @namespace          https://github.com/kevin823lin
// @version            0.1
// @description        Add support for sort hololyzer's super chat list by name.
// @description:zh     讓 hololyzer 的超級留言清單支援按姓名排序
// @description:zh-TW  讓 hololyzer 的超級留言清單支援按姓名排序
// @description:zh-CN  让 hololyzer 的超级留言清单支持按姓名排序
// @author             kevin823lin
// @match              https://www.hololyzer.net/*/superchat/*
// @icon               https://www.google.com/s2/favicons?domain=hololyzer.net
// @grant              none
// @run-at             document-start
// @date               2021-12-11
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    window.addEventListener('DOMContentLoaded', function (event) {
        document.body.dataset.sortBy = "time";
        insertButton();
    }, false);

    function insertButton() {
        const sortByTimeBtn = document.createElement('button');
        const sortByNameBtn = document.createElement('button');
        const copyTableBtn = document.createElement('button');
        sortByTimeBtn.innerText = "時間排序";
        sortByNameBtn.innerText = "姓名排序";
        copyTableBtn.innerText = "複製表格";
        sortByTimeBtn.addEventListener("click", function () {
            if (document.body.dataset.sortBy !== "time") {
                window.location.href = window.location.href;
            }
        });
        sortByNameBtn.addEventListener("click", async function () {
            if ((document.body.dataset.sortBy) !== "name") {
                document.body.dataset.sortBy = "name";
                await waitElementsLoaded('table[border]');
                main();
            }
        });
        copyTableBtn.addEventListener("click", function () {
            copyTable();
        });
        document.body.insertAdjacentElement('afterbegin', copyTableBtn);
        document.body.insertAdjacentElement('afterbegin', sortByNameBtn);
        document.body.insertAdjacentElement('afterbegin', sortByTimeBtn);
    }

    function main() {
        moveYenCol();
        sortByName();
        insertRemoveDuplicatesCol();
    }

    function moveYenCol() {
        const tbody = document.querySelector('table[border] > tbody');
        const trs = tbody.querySelectorAll("tr");
        const insertIndex = [...tbody.querySelectorAll("th")].findIndex(th => th.matches('[style]'));
        tbody.querySelectorAll('[rowspan]').forEach(a => a.removeAttribute('rowspan'))
        trs.forEach((tr, i) => {
            if (i % 2) {
                const parentEle = trs[i - 1];
                const childrenEle = parentEle.children[insertIndex + 1];
                const insertEle = tr.querySelector("th") || tr.querySelector("td");
                childrenEle.removeAttribute('style');
                insertEle.removeAttribute('style');
                insertEle.parentElement.remove();
                parentEle.insertBefore(insertEle, childrenEle);
            }
        })
    }

    function sortByName() {
        const tbody = document.querySelector('table[border] > tbody');
        const trs = [...tbody.querySelectorAll("tr")].filter(tr => {
            return tr.querySelector('td');
        });

        let sortIndex = [...tbody.querySelectorAll('th')].findIndex(th => th.innerText === "チャンネル名");
        if (sortIndex === -1) {
            sortIndex = 6;
        }
        trs.sort(function (a, b) {
            var keyA = a.querySelector(`td:nth-child(${sortIndex + 1})`).textContent;
            var keyB = b.querySelector(`td:nth-child(${sortIndex + 1})`).textContent;
            return keyA.localeCompare(keyB, 'ja');
        });
        for (const tr of trs) {
            tbody.append(tr);
        }
    }

    function insertRemoveDuplicatesCol() {
        const tbody = document.querySelector('table[border] > tbody');
        const trs = [...tbody.querySelectorAll("tr")].filter(tr => {
            return tr.querySelector('td');
        });

        let insertIndex = [...tbody.querySelectorAll('th')].findIndex(th => th.innerText === "No");
        if (insertIndex === -1) {
            insertIndex = 0;
        }
        let sortIndex = [...tbody.querySelectorAll('th')].findIndex(th => th.innerText === "チャンネル名");
        if (sortIndex === -1) {
            sortIndex = 6;
        }

        let count = 0;
        const countList = new Array();
        for (const [i, tr] of trs.entries()) {
            const preName = trs[i - 1] && trs[i - 1].querySelector(`:nth-child(${sortIndex + 1})`)?.innerText;
            const name = tr.querySelector(`:nth-child(${sortIndex + 1})`)?.innerText;
            countList.push(preName !== name ? ++count : count);
        }
        for (const [i, tr] of trs.entries()) {
            const insertEle = tr.insertCell(insertIndex + 1);
            insertEle.innerText = countList[i];
            insertEle.style = "text-align: right";
        }
        const parentEle = tbody.querySelector("tr");
        const childrenEle = parentEle.children[insertIndex + 1];
        const insertEle = document.createElement("th");
        insertEle.innerText = "去除重複";
        insertEle.style = "white-space: nowrap;";
        parentEle.insertBefore(insertEle, childrenEle);
    }

    function copyTable() {
        copyElement(document.querySelector('table[border] > tbody'));
    }

    function copyElement(ele) {
        if (document.createRange && window.getSelection) {
            const sel = window.getSelection();
            const oldRange = Array.apply(null, new Array(sel.rangeCount)).map((a, i) => sel.getRangeAt(i));
            const copyRange = document.createRange();
            sel.removeAllRanges();
            try {
                copyRange.selectNode(ele);
                sel.addRange(copyRange);
            } catch (e) {
                copyRange.selectNodeContents(ele);
                sel.addRange(copyRange);
            }
            document.execCommand("copy");
            sel.removeAllRanges();
            oldRange.forEach(range => { sel.addRange(range) });
        } else {
            alert("複製失敗");
        }
    }

    function waitElementsLoaded(...eles) {
        return Promise.all(eles.map(ele => {
            return new Promise(async resolve => {
                while (!document.querySelector(ele)) {
                    await wait(100);
                }
                resolve();
            });
        }));
    }

    function wait(ms) {
        try {
            return new Promise(r => setTimeout(r, ms));
        } catch (e) {
            console.error(`wait: ${e}`);
        }
    }
})();