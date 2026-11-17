
import {
  readFileSync,
  writeFileSync,
  copyFileSync
} from 'node:fs';

const file = 'src/Home.jsx';
const original = readFileSync(file, 'utf8');
const usesCRLF = original.includes('\r\n');

let code = original.replace(/\r\n/g, '\n');

function replaceOnce(before, after, label) {
  const count = code.split(before).length - 1;

  if (count !== 1) {
    throw new Error(
      `${label}: expected 1 match, found ${count}. File unchanged.`
    );
  }

  code = code.replace(before, after);
}

// Check existing search and category features.
for (const marker of [
  'const SEARCH_ALIASES =',
  'const ROOT_NAMES =',
  'const handleSearchSubmit = event => {',
  'id="showroom-products"',
  'getCategoryPath(',
  "openCollection('All', { keepSearch: true })"
]) {
  if (!code.includes(marker)) {
    throw new Error(
      `Expected customer search feature missing: ${marker}`
    );
  }
}

const alreadyUpdated = [
  'const [productsLoading, setProductsLoading]',
  'const [productsError, setProductsError]',
  'Retry Loading'
].map(marker => code.includes(marker));

if (alreadyUpdated.every(Boolean)) {
  console.log(
    'Step 4A is already installed. No changes needed.'
  );
  process.exit(0);
}

if (alreadyUpdated.some(Boolean)) {
  throw new Error(
    'Partial Step 4A changes detected. File unchanged.'
  );
}

// 1. Add loading and error states.
replaceOnce(
  `  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);`,

  `  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [categories, setCategories] = useState([]);`,

  'Product loading state'
);

// 2. Improve product fetching and error handling.
replaceOnce(
  `  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(
        \`\${API}/api/products\`,
        publicConfig
      );

      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('Product loading failed:', error);
    }
  }, []);`,

  `  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError('');

    try {
      const response = await axios.get(
        \`\${API}/api/products\`,
        publicConfig
      );

      if (!Array.isArray(response.data?.products)) {
        throw new Error(
          'Unexpected jewellery catalogue response.'
        );
      }

      setProducts(response.data.products);
    } catch (error) {
      setProductsError(errorText(error));
      console.error('Product loading failed:', error);
    } finally {
      setProductsLoading(false);
    }
  }, []);`,

  'Product fetch and retry'
);

// 3. Show loading, error and retry messages.
replaceOnce(
  `              {filteredProducts.length === 0 ? (`,

  `              {productsLoading && products.length === 0 ? (
                <div
                  className="rj-empty-products rj-empty-products--refined"
                  role="status"
                >
                  <h3>Loading jewellery collections...</h3>
                  <p>
                    Please wait while we load the latest designs.
                  </p>
                </div>
              ) : productsError && products.length === 0 ? (
                <div
                  className="rj-empty-products rj-empty-products--refined"
                  role="alert"
                >
                  <h3>Unable to load jewellery</h3>
                  <p>{productsError}</p>

                  <button
                    type="button"
                    className="rj-whatsapp-cta"
                    onClick={fetchProducts}
                  >
                    <RefreshCw size={18} />
                    Retry Loading
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (`,

  'Catalogue loading/error UI'
);

// 4. Show the correct weight label.
replaceOnce(
  `                      Net Weight:`,
  `                      Main Weight:`,
  'Main product weight label'
);

// 5. Backup before saving.
const backup =
  `${file}.before-step4a-${Date.now()}.bak`;

copyFileSync(file, backup);

writeFileSync(
  file,
  usesCRLF
    ? code.replace(/\n/g, '\r\n')
    : code,
  'utf8'
);

console.log(
  'Step 4A installed: loading, errors, retry, main weight.'
);

console.log('Backup:', backup);
console.log('Next command: npm run build');
