class ReviewsCountSearchFilter extends SearchFilter {

    _minCount;
    _maxCount;

    _val = null;

    constructor(feature) {
        super("as-reviews-count", feature);
    }

    get active() {
        return this._minCount.value || this._maxCount.value;
    }

    getHTML() {

        return `<div class="as-reviews-count-filter">
                    <div class="as-reviews-count-filter__header">${Localization.str.search_filters.reviews_count.count}</div>
                    <div class="as-reviews-count-filter__content js-reviews-count-filter">
                        <input class="as-reviews-count-filter__input js-reviews-count-input js-reviews-count-lower" type="number" min="0" step="100" placeholder="${Localization.str.search_filters.reviews_count.min_count}">
                        -
                        <input class="as-reviews-count-filter__input js-reviews-count-input js-reviews-count-upper" type="number" min="0" step="100" placeholder="${Localization.str.search_filters.reviews_count.max_count}">
                        <input type="hidden" name="as-reviews-count">
                    </div>
                </div>`;
    }

    setup(params) {

        this._minCount = document.querySelector(".js-reviews-count-lower");
        this._maxCount = document.querySelector(".js-reviews-count-upper");

        for (let input of document.querySelectorAll(".js-reviews-count-input")) {

            input.addEventListener("change", () => {
                this.apply();

                let minVal = this._minCount.value;
                let maxVal = this._maxCount.value;
                let val = null;

                if ((minVal && Number(minVal) !== 0) || maxVal) {
                    val = `${minVal}-${maxVal}`;
                }
                
                this.value = val;
            });

            input.addEventListener("keydown", e => {
                if(e.key === "Enter") {
                    // Prevents unnecessary submitting of the advanced search form
                    e.preventDefault();

                    input.dispatchEvent(new Event("change"));
                }
            });
        }

        super.setup(params);
    }

    setState(params) {

        let lowerCountVal = "";
        let upperCountVal = "";

        if (params.has("as-reviews-count")) {

            let val = params.get("as-reviews-count");
            let match = val.match(/(^\d*)-(\d*)/);

            this._value = val;

            if (match) {
                let [, lower, upper] = match;
                lower = parseInt(lower);
                upper = parseInt(upper);

                if (!isNaN(lower)) {
                    lowerCountVal = lower;
                }
                if (!isNaN(upper)) {
                    upperCountVal = upper;
                }
            }
        }

        if (lowerCountVal !== this._minCount.value) {
            this._minCount.value = lowerCountVal;
        }
        if (upperCountVal !== this._maxCount.value) {
            this._maxCount.value = upperCountVal;
        }
    }

    addRowMetadata(rows = document.querySelectorAll(".search_result_row:not([data-as-review-count])")) {

        for (let row of rows) {
            let reviewCount = 0;

            let reviewsNode = row.querySelector(".search_review_summary");
            if (reviewsNode) {
                let match = reviewsNode.dataset.tooltipHtml.match(/\d{1,3}%.*?((?:\d{1,3},?)+)/);
                if (match) {
                    reviewCount = Number(match[1].replace(/,/g, ""));
                }
            }

            row.dataset.asReviewCount = reviewCount;
        }
    }

    apply(rows = document.querySelectorAll(".search_result_row")) {

        let minCount = Number(this._minCount.value);
        let maxCount = this._maxCount.value === "" ? Infinity : Number(this._maxCount.value);

        for (let row of rows) {
            let rowCount = Number(row.dataset.asReviewCount);
            row.classList.toggle("as-reviews-count", rowCount < minCount || rowCount > maxCount);
        }
    }
}