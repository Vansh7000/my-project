var categoryFilter = document.getElementById('category-filter');
var productItems = document.getElementsByClassName('product-item');

categoryFilter.onchange = function() {
  filterProducts();
};

function filterProducts() {
  var selectedCategory = categoryFilter.value;
    for (var i = 0; i < productItems.length; i++) {
        var item = productItems[i]; 
        var itemCategory = item.getAttribute('data-category');
    if (selectedCategory === 'all' || selectedCategory === itemCategory) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  }
}
filterProducts();