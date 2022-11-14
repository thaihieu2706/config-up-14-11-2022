;(function () {
	var fa = document.createElement("style")
	fa.type = "text/css"
	fa.textContent =
		'@font-face { font-family: Roboto; src: url("' +
		chrome.extension.getURL("css/Roboto-Regular.ttf") +
		'"); }'
	document.head.appendChild(fa)

	$(document).on("keydown", function (e) {
		if (e.keyCode === 27 && $(".black-box-search-page-holder")) {
			closeSearch()
		}
	})

	var savedTerm = ""
})()

function doHighlight(bodyText, searchTerm, highlightStartTag, highlightEndTag) {
	// the highlightStartTag and highlightEndTag parameters are optional
	if (!highlightStartTag || !highlightEndTag) {
		highlightStartTag =
			"<font style='color:blue; background-color:yellow;' class='black-box-found-text'>"
		highlightEndTag = "</font>"
	}

	var newText = ""
	var i = -1
	var lcSearchTerm = searchTerm.toLowerCase()
	var lcBodyText = bodyText.toLowerCase()

	while (bodyText.length > 0) {
		i = lcBodyText.indexOf(lcSearchTerm, i + 1)
		if (i < 0) {
			newText += bodyText
			bodyText = ""
		} else {
			// skip anything inside an HTML tag
			if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i)) {
				// skip anything inside a <script> block
				if (
					lcBodyText.lastIndexOf("/script>", i) >=
					lcBodyText.lastIndexOf("<script", i)
				) {
					newText +=
						bodyText.substring(0, i) +
						highlightStartTag +
						bodyText.substr(i, searchTerm.length) +
						highlightEndTag
					bodyText = bodyText.substr(i + searchTerm.length)
					lcBodyText = bodyText.toLowerCase()
					i = -1
				}
			}
		}
	}

	return newText
}
/*
 * This is sort of a wrapper function to the doHighlight function.
 * It takes the searchText that you pass, optionally splits it into
 * separate words, and transforms the text on the current web page.
 * Only the "searchText" parameter is required; all other parameters
 * are optional and can be omitted.
 */
function highlightSearchTerms(
	searchText,
	treatAsPhrase,
	warnOnFailure,
	highlightStartTag,
	highlightEndTag
) {
	// if the treatAsPhrase parameter is true, then we should search for
	// the entire phrase that was entered; otherwise, we will split the
	// search string so that each word is searched for and highlighted
	// individually
	if (treatAsPhrase) {
		searchArray = [searchText]
	} else {
		searchArray = searchText.split(" ")
	}

	if (!document.body || typeof document.body.innerHTML == "undefined") {
		if (warnOnFailure) {
			alert(
				"Sorry, for some reason the text of this page is unavailable. Searching will not work."
			)
		}
		return false
	}

	var bodyText = document.body.innerHTML
	for (var i = 0; i < searchArray.length; i++) {
		bodyText = doHighlight(
			bodyText,
			searchArray[i],
			highlightStartTag,
			highlightEndTag
		)
	}

	document.body.innerHTML = bodyText

	//scroll to selected text
	$(".black-box-found-text").get(0).scrollIntoView({
		behavior: "smooth",
		block: "center",
		inline: "center"
	})
	return true
}

chrome.runtime.onMessage.addListener((req, sender, res) => {
	if (req.message === "search") {
		openSearch(req)
	} else if (req.message === "show-search-results") {
		// closeSearch()
		$(".black-box-search-page-holder .search-middle .title").text("Results")
		$(
			".black-box-search-page-holder .search-middle .search-result-items"
		).empty()
		$(".black-box-search-page-holder .search-top .black-box-loader").css(
			"visibility",
			"hidden"
		)
		if (req.filter !== "videos") {
			$(".black-box-search-page-holder .filter").removeClass("active")
			$(".black-box-search-page-holder .filter.all").addClass("active")
		}
		$(".black-box-search-page-holder .search-middle").removeClass("hide")
		$(".black-box-search-page-holder .filter-options").removeClass("hide")

		var data = req.data.split(";")
		// highlightSearchTerms(data)
		data.forEach((result) => {
			// highlightSearchTerms(result)
			if (result.length != 0) {
				var $el
				$el = $(`
					<a target="_blank" class="search-item">
						<div class="search-title">${result}</div>
					</a>
				`)
				$(
					".black-box-search-page-holder .search-middle .search-result-items"
				).append($el)
			}
		})
	}

	return true
})

function closeSearch() {
	$(".black-box-search-page-holder").off()
	$(".black-box-search-page-holder").remove()
}

function openSearch(req) {
	if ($(`.black-box-search-page-holder`).length === 0) {
		var $search = $(`
			<div class="search-holder black-box-search-page-holder">
				<div class="search-container">
					<div class="search-bar">
						<div class="search-top">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								x="0px"
								y="0px"
								width="14"
								height="14"
								viewBox="0 0 172 172"
								style="fill: #000000"
								class="search-icon"
							>
								<g
									fill="none"
									fill-rule="nonzero"
									stroke="none"
									stroke-width="1"
									stroke-linecap="butt"
									stroke-linejoin="miter"
									stroke-miterlimit="10"
									stroke-dasharray=""
									stroke-dashoffset="0"
									font-family="none"
									font-weight="none"
									font-size="none"
									text-anchor="none"
									style="mix-blend-mode: normal"
								>
									<path
										d="M0,172v-172h172v172z"
										fill="none"
									></path>
									<g fill="#c1c9d2">
										<path
											d="M72.24,10.32c-32.26344,0 -58.48,26.21656 -58.48,58.48c0,32.26344 26.21656,58.48 58.48,58.48c12.76563,0 24.56375,-4.11187 34.185,-11.0725l45.2575,45.15l9.675,-9.675l-44.72,-44.8275c8.78813,-10.23937 14.0825,-23.52906 14.0825,-38.055c0,-32.26344 -26.21656,-58.48 -58.48,-58.48zM72.24,17.2c28.54125,0 51.6,23.05875 51.6,51.6c0,28.54125 -23.05875,51.6 -51.6,51.6c-28.54125,0 -51.6,-23.05875 -51.6,-51.6c0,-28.54125 23.05875,-51.6 51.6,-51.6z"
										></path>
									</g>
								</g>
							</svg>
							<input
								type="text"
								class="search-input"
								placeholder="Go to"
							/>
							<img class="black-box-loader" src="${chrome.extension.getURL(
								"images/loader.svg"
							)}" alt="loader">
						</div>
						<div class="search-middle">
							<div class="title-strip-holder">
								<div class="title">Recently viewed</div>
								<div class="filter-options hide">
								</div>
							</div>
							
							<div class="search-result-items"></div>
						</div>
						<div class="search-bottom">
							<div class="search-text">
								Press <span class="command">CMD-J</span>or<span class="command">Alt-O</span> to
								use the BLACKBOX deep search.
							</div>
							
						</div>
					</div>
				</div>
			</div>
		`)

		$(`body`).prepend($search)
		$(".black-box-search-page-holder .search-input").focus()
		if (req.data !== undefined) {
			$(".black-box-search-page-holder .search-input").val(req.data)
			searchQuery(req.data)
			savedTerm = req.data
		}

		$(".black-box-search-page-holder").on("click", function (e) {
			if ($(e.target).hasClass("black-box-search-page-holder")) {
				closeSearch()
			}
		})
		$(".black-box-search-page-holder .filter").on("click", function () {
			$(".black-box-search-page-holder .filter").removeClass("active")
			$(this).addClass("active")
			if ($(this).hasClass("videos")) {
				searchQuery(`${savedTerm}`, "videos")
			} else {
				searchQuery(savedTerm)
			}
		})
		$(document).on(
			"click",
			".black-box-search-page-holder .search-item",
			function () {
				$(".black-box-found-text").contents().unwrap()
				const text = $(this).find(".search-title").text().trim()
				closeSearch()
				highlightSearchTerms(text, true)
			}
		)
		chrome.storage.local.get(["searched"], function (items) {
			if (items.searched !== undefined) {
				var arr = items.searched
				arr.forEach((el) => {
					$(
						".black-box-search-page-holder .search-middle .search-result-items"
					).append($.parseHTML(el))
				})
			} else {
				$(".black-box-search-page-holder .search-middle").addClass(
					"hide"
				)
			}
		})
		$(".black-box-search-page-holder .search-input").on(
			"keydown",
			function (e) {
				const query = $(this).val()
				if (e.keyCode === 13 && query !== "") {
					searchQuery(query)
					savedTerm = query
				}
			}
		)
	} else {
		closeSearch()
	}
}

function searchQuery(query, from = "") {
	$(".black-box-search-page-holder .search-top .black-box-loader").css(
		"visibility",
		"visible"
	)
	if (!query) {
		query = savedTerm
	}
	var text = htmlText(document.body.innerHTML);
	chrome.runtime.sendMessage({
		message: "search-web",
		data: query,
		filter: from,
		fullText: text
	})
}

function htmlText(html){
	html = html.replace(/<style([\s\S]*?)<\/style>/gi, '');
	html = html.replace(/<script([\s\S]*?)<\/script>/gi, '');
	html = html.replace(/<\/div>/ig, '\n');
	html = html.replace(/<\/li>/ig, '\n');
	html = html.replace(/<li>/ig, '  *  ');
	html = html.replace(/<\/ul>/ig, '\n');
	html = html.replace(/<\/p>/ig, '\n');
	html = html.replace(/<br\s*[\/]?>/gi, "\n");
	html = html.replace(/<[^>]+>/ig, '');
	html=html.split('\n').join(' ')
	html=html.split('\t').join(' ')
	return html
}