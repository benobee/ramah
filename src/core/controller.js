const controller = {
    init (events) {
        this.events = events;
        this.cacheDOM();
        this.injectClassNames();
        this.renderUIComponents();
        this.bindClickEvents();
        this.currentIndex = 0;
        this.events.on("page-change", (page) => {
            //console.log(this.container.offsetHeight);
            this.currentIndex = Number(page.index);
            //handle top nav buttons
            this.topNavButtons.forEach((button, i) => {
                button.classList.add("active");
                if (i > page.index) {
                    button.classList.remove("active");
                }
            });
            this.topNav.querySelector(`[data-page-id="${page.index}"]`).classList.add("active");

            //handle pages
            this.formPages.forEach((formPage) => {
                this.activatePage(formPage);
            });

            this.formPages[ page.index ].nodeList.forEach((node) => {
                node.classList.add("active");
            });

            //handle errors
            this.errorHandling(page.index);

            //handle bottom
            if (page.index !== 2) {
                this.bottomNav.classList.add("active");
            } else {
                this.bottomNav.classList.remove("active");
            }

            if (page.index === 0) {
                this.bottomNavButtons[ 0 ].classList.add("disabled");
            } else {
                this.bottomNavButtons[ 0 ].classList.remove("disabled");
            }
        });

        const button = document.getElementById("sendDonation");

        button.addEventListener("click", () => {
            this.errorHandling(2);
        });

        //make the first page active
        this.events.emit("page-change", { index: 0 });
    },

    errorHandling (index) {
        let ids = [];

        this.formPages[ index ].nodeList.forEach((node) => {
            ids = ids.concat(this.getInputIdArray(node));
        });

        this.findErrorDivs(ids);
    },

    /**
     * run through each node list to get each input element id
     * for error popups that are rendered in separate divs outside
     * of container element.
     *
     * @param  {Array} activePageNodeList NodeList
     */

    getInputIdArray (node) {
        let ids = this.toArray(node.querySelectorAll("input"));

        ids = ids.map((item) => {
            return item.getAttribute("id");
        });

        return ids;
    },

    /**
     * [findErrorDivs iterate through each id to find the error
     * div programatically. Errors divs are rendered outside parent
     * container. ]
     * @param  {Array} idList list of ids
     */

    findErrorDivs (idList) {
        const errors = this.toArray(document.querySelectorAll(".error-popup.active"));

        errors.forEach((node) => {
            if (node) {
                node.classList.remove("error-popup", "active");
            }
        });

        idList.forEach((id) => {
            const errorDv = document.getElementById(`${id}-errorDv`);

            if (errorDv) {
                errorDv.classList.add("error-popup", "active");
            }
        });
    },
    injectClassNames () {
        this.formPages.forEach((page, index) => {
            page.nodeList.forEach((node) => {
                node.classList.add(`page-${index + 1}`, "form-page");
            });
        });
    },
    activatePage (formPage) {
        formPage.nodeList.forEach((nodeList) => {
            nodeList.classList.remove("active");
        });
    },
    toArray (nodeList) {
        return [].slice.call(nodeList);
    },
    bindClickEvents () {
        this.topNavButtons = this.toArray(this.topNav.querySelectorAll(".app__button"));
        this.topNavButtons.forEach((item) => {
            item.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.pageId;

                this.events.emit("page-change", { index: Number(id) });
            });
        });
        this.bottomNavButtons = this.toArray(this.bottomNav.querySelectorAll(".app__button"));
        this.bottomNavButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                const label = e.currentTarget.dataset.label;

                if (this.currentIndex !== 2) {
                    if (label === "prev") {
                        this.events.emit("page-change", { index: this.currentIndex - 1 });
                    } else if (label === "next") {
                        this.events.emit("page-change", { index: this.currentIndex + 1 });
                    }
                }
            });
        });
    },
    cacheDOM () {
        this.container = document.querySelector("#centerContentWrap");
        this.formPages = [
            { nodeList: this.toArray(this.container.querySelectorAll("#donation1")) },
            { nodeList: this.toArray(this.container.querySelectorAll(".tributeSection, #donation2 > div.donateSlide > div > div.donationSection > div:nth-child(-n+6)")) },
            { nodeList: this.toArray(this.container.querySelectorAll("#donation2 > div.donateSlide > div > div.donationSection > div.donationSection.noBorderBot.noPaddingBot.toggleMargin, #donation3, .donateBtnCont")) }
        ];
        this.topNav = this.buildTopNav();
        this.bottomNav = this.buildBottomNav();
    },
    buildTopNav () {
        const labels = {
            page1: "Amount",
            page2: "Name",
            page3: "Payment",
            message: "DONATE TODAY"
        };

        return this.createElement("div", "top-nav-wrapper", `
            <div class="app__nav-top nav">
                <h3>${labels.message}</h3>
                <div class="app__ui-wrapper">
                    <div class="app__button" data-page-id="0">
                        <div class="label">${labels.page1}</div>
                        <div class="number">1</div>
                    </div>
                    <div class="app__button" data-page-id="1">
                        <div class="label">${labels.page2}</div>
                        <div class="number">2</div>
                        <div class="line"></div>
                    </div>
                    <div class="app__button" data-page-id="2">
                        <div class="label">${labels.page3}</div>
                        <div class="number">3</div>
                        <div class="line"></div>
                    </div>
                </div>
            </div>`);
    },
    buildBottomNav () {
        const labels = {
            button1: "Previous",
            button2: "Next"
        };

        return this.createElement("div", "bottom-nav-wrapper", `
            <div class="app__nav-bottom nav">
                <div class="app__ui-wrapper">
                    <div class="app__button" data-label="prev">${labels.button1}</div>
                    <div class="app__button" data-label="next">${labels.button2}</div>
                </div>
            </div>
        `);
    },
    createElement (type, classNames, html) {
        const el = document.createElement(type);

        el.classList.add("app__injected-ui");
        el.classList.add(classNames);
        el.innerHTML = html;

        return el;
    },
    renderUIComponents () {
        const top = document.getElementById("slideWrap");

        top.parentNode.insertBefore(this.topNav, top);
        this.renderDiv("#centerContentWrap", this.bottomNav);
    },
    renderDiv (target, node) {
        const injectPoint = document.querySelector(target);

        injectPoint.appendChild(node);
    },
    makeActivePage (page) {
        page.classList.add("form-page__active");
    }
};

export default controller;