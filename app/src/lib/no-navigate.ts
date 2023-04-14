let noNavigate = false;

/**
 * Allows to toggle the page navigation warning behavior
 * @param {boolean} value if true a warning is shown when the user tries to navigate away from the page when false no warning is shown
 */
function setNoNavigate(value: boolean) {
  noNavigate = value;
}

window.onbeforeunload = function() {
  return noNavigate ? true : undefined;
};

export { setNoNavigate };
