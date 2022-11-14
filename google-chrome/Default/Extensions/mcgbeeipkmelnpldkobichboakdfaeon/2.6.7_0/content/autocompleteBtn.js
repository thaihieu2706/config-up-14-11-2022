//colab element
;(function () {
	const url = window.location.href
	var addBtn = false
	if (url.includes("colab.research.google.com")) {
		addBtn = true

		const intCheck = setInterval(() => {
			var target = document.querySelector(".view-lines")
			if (target !== null) {
				clearInterval(intCheck)
				$(".view-lines").each((idx, el) => {
					var observer = new MutationObserver(function (mutations) {
						mutations.forEach(function (mutation) {
							const el = mutation.addedNodes[0]
							var text = $(el).text().trim().replace(/\s/g, " ")
							if (text.length > 5) {
								question = text
								// console.log(question)
							}
						})
					})

					var config = {
						attributes: true,
						childList: true,
						characterData: true
					}
					observer.observe(el, config)
				})
			}
		}, 1000)

		const bodyDetect = setInterval(() => {
			var target = document.body
			if (target !== null) {
				clearInterval(bodyDetect)

				var observer = new MutationObserver(function (mutations) {
					mutations.forEach(function (mutation, idx) {
						if (idx === 0) {
							const el = mutation.addedNodes[0]
							var $el = $(el).find(".view-lines")
							if ($el.length > 0) {
								$el.addClass("black-box-seen")
								addMutation($el)
							}
						}
					})
				})

				var config = {
					childList: true,
					characterData: true,
					attributes: true,
					subtree: true
				}
				observer.observe(target, config)
			}
		}, 1000)
	} else if (url.includes("jupyter.org")) {
		addBtn = true

		const intCheck = setInterval(() => {
			var target = document.querySelector(".CodeMirror-code")
			if (target !== null) {
				clearInterval(intCheck)
				$(".CodeMirror-code").each((idx, el) => {
					var observer = new MutationObserver(function (mutations) {
						mutations.forEach(function (mutation, idx) {
							if (idx === 0) {
								const el = mutation.addedNodes[0]
								if ($(el).hasClass("CodeMirror-line")) {
									question = $(el).text()
									// console.log(question)
								}
							}
						})
					})

					var config = {
						attributes: true,
						childList: true,
						characterData: true
					}
					observer.observe(el, config)
				})
			}
		}, 1000)

		const bodyDetect = setInterval(() => {
			var target = document.body
			if (target !== null) {
				clearInterval(bodyDetect)
				var observer = new MutationObserver(function (mutations) {
					mutations.forEach(function (mutation, idx) {
						if (idx === 0) {
							const el = mutation.addedNodes[0]
							var $el = $(el).find(".CodeMirror-lines")
							if (
								$el.length > 0 &&
								!$el.hasClass("CodeMirror-cursors")
							) {
								addMutation($el)
							}
						}
					})
				})

				var config = {
					childList: true,
					characterData: true,
					attributes: true,
					subtree: true
				}
				observer.observe(target, config)
			}
		}, 1000)
	} else if (url.includes("replit.com")) {
		addBtn = true

		$(document).on("keydown", ".cm-content", function () {
			setTimeout(() => {
				question = $(this)
					.find(".cm-activeLine")
					.text()
					.trim()
					.replace(/\s/g, " ")
				// console.log(question)
			}, 50)
		})
	}

	if (addBtn) {
		const $chat = $(`
		<div class="black-box-autocomplete-btn active">
			<div class="black-box-autocomplete-floating">
				<div class="black-box-autocomplete-top-bar">
					<div></div>
					<div class="black-box-left">
						<div class="black-box-btn-holder black-box-close-autocomplete">
						<img src="${chrome.extension.getURL("images/close.svg")}" alt="">
						</div>
					</div>
				</div>
				<div class="black-box-body-holder"></div>
			</div>

			<div class="black-box-autocomplete-button">
				<img src="${chrome.extension.getURL(
					"images/icon16.png"
				)}" class="black-box-logo-autocomplete" alt="">
				<img src="${chrome.extension.getURL(
					"images/loader.svg"
				)}" class="black-box-loader-autocomplete" alt="">
			</div>
		</div>
		`)

		$("body").prepend($chat)
	}
})()

$(document).on("click", ".black-box-autocomplete-button", function () {
	if ($(".black-box-autocomplete-floating").hasClass("active")) {
		clearTimeout(removeTime)
		hide()
	} else {
		getAutoComplete()
	}
})

function hide() {
	$(".black-box-autocomplete-floating").removeClass("active")
	setTimeout(() => {
		$(".black-box-autocomplete-floating").css("display", "none")
	}, 350)
}

function show() {
	$(".black-box-autocomplete-floating").css("display", "block")

	setTimeout(() => {
		$(".black-box-autocomplete-floating").addClass("active")
	}, 10)
}

function toggle() {
	if ($(".black-box-autocomplete-floating").hasClass("active")) {
		hide()
	} else {
		show()
	}
}

function hideShowOverlay() {
	if ($(".black-box-autocomplete-btn").hasClass("active")) {
		$(".black-box-autocomplete-btn").removeClass("active")
	} else {
		$(".black-box-autocomplete-btn").addClass("active")
	}
}

$(document).on("click", ".black-box-close-autocomplete", function () {
	hide()
})

function addMutation($el) {
	const target = $el[0]
	var observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			const el = mutation.addedNodes[0]

			var text = $(el).text().trim().replace(/\s/g, " ")
			// for jupyter
			if (!text.startsWith("xxxx") && text !== "") {
				question = text
				// console.log(question)
			}
		})
	})

	var config = {
		childList: true,
		characterData: true,
		attributes: true,
		subtree: true
	}
	observer.observe(target, config)
}

var question = ""
var removeTime

const $defaultOptionAutocomplete = $(`<img src="${chrome.extension.getURL(
	"images/done-code.png"
)}" class="black-box-empty-check" alt="">
<div class="black-box-empty-autocomplete">
	<span class="black-box-main-text">We got the snippet for you!</span>
	<span class="black-box-sub-text">You can now paste it anywhere</span>
</div>`)

function showBodyLoader() {
	$(".black-box-autocomplete-button").addClass("loader")
}
function hideBodyLoader() {
	$(".black-box-autocomplete-button").removeClass("loader")
}

chrome.runtime.onMessage.addListener((req, sender, res) => {
	if (req.message === "canPaste") {
		hideBodyLoader()
		$(".black-box-body-holder").empty()
		show()
		removeTime = setTimeout(() => {
			hide()
		}, 3000)
		$(".black-box-body-holder").append($defaultOptionAutocomplete)
	}
})

function getAutoComplete() {
	if (question.length > 5) {
		showBodyLoader()
		chrome.runtime.sendMessage({
			message: "getAutoComplete",
			text: question
		})
	}
}