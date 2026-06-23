const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const productContainer = document.getElementById("productContainer");
const PRODUCTS_API_URL = "https://dummyjson.com/products?limit=150";

let allProducts = [];

searchButton.addEventListener("click", searchProducts);

function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function getSearchVariants(searchText) {
    const variants = new Set();
    const normalized = normalizeText(searchText);

    if (normalized) {
        variants.add(normalized);
        variants.add(normalized.replace(/\s+/g, ""));
    }

    if (normalized.endsWith("s")) {
        variants.add(normalized.slice(0, -1));
    }

    if (normalized.includes("shirt")) {
        variants.add("shirt");
        variants.add("shirts");
        variants.add("tshirt");
        variants.add("tshirts");
        variants.add("t shirts");
    }

    return [...variants].filter(Boolean);
}

async function searchProducts() {
    const searchText = searchInput.value.trim();

    if (searchText === "") {
        displayProducts(allProducts);
        return;
    }

    const searchVariants = getSearchVariants(searchText);

    const filteredProducts = allProducts.filter(product => {
        const searchableText = normalizeText(
            `${product.title} ${product.category} ${product.description}`
        );

        return searchVariants.some(variant => searchableText.includes(variant));
    });

    displayProducts(filteredProducts);
}

async function loadProducts() {
    productContainer.innerHTML = "<h2>Loading products...</h2>";

    try {
        const response = await fetch(PRODUCTS_API_URL);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        allProducts = Array.isArray(data) ? data : data.products ?? [];

        displayProducts(allProducts);
    } catch (error) {
        productContainer.innerHTML = "<h2>Failed to fetch products!</h2>";
        console.error(error);
    }
}

function displayProducts(products) {
    productContainer.innerHTML = "";

    if (products.length === 0) {
        productContainer.innerHTML = "<h2>No products found!</h2>";
        return;
    }

    products.forEach(product => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        const ratingValue = typeof product.rating === "number" ? product.rating : product.rating?.rate ?? 0;
        const ratingCount = product.reviews?.length ?? product.rating?.count ?? 0;
        const starCount = Math.max(0, Math.min(5, Math.round(ratingValue)));
        const stars = "★".repeat(starCount) + "☆".repeat(5 - starCount);
        const priceInRupees = Math.round(product.price * 83);
        const imageUrl = product.thumbnail ?? product.image;

        card.innerHTML = `
            <div class="product-image-wrap">
                <img src="${imageUrl}" alt="${product.title}" />
            </div>
            <h3>${product.title}</h3>
            <p class="price"><span>Price:</span> ₹${priceInRupees}</p>
            <p class="delivery">Free delivery</p>
            <p class="rating">${ratingValue.toFixed(1)} <span class="stars">${stars}</span> (${ratingCount})</p>
        `;

        productContainer.appendChild(card);
    });
}

searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchProducts();
    }
});

loadProducts();