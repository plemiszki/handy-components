export const resetNiceSelect = (obj) => {
  // assumes jQuery (and nice select) have been loaded via script tags
  var $dropDowns = $(obj.selector);
  $dropDowns.niceSelect("destroy");
  $dropDowns.unbind("change");
  $dropDowns.niceSelect().on("change", obj.func);
};

export const setUpNiceSelect = (obj) => {
  // assumes jQuery (and nice select) have been loaded via script tags
  var $dropDowns = $(obj.selector);
  if (
    $dropDowns[0] &&
    (!$dropDowns[0].nextSibling ||
      !$dropDowns[0].nextSibling.classList.contains("nice-select"))
  ) {
    $dropDowns.niceSelect().on("change", obj.func);
  }
};
