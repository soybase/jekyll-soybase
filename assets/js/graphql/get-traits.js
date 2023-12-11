import { query } from './query.js';
//import { modalLink } from './modal.js';


/** The GraphQL query used to get traits. */
export const getTraitsQuery = `
query TraitQuery($pageSize: Int, $page: Int, $name: String, $studyType: String, $publicationId: String, $author: String) {
    traits(pageSize: $pageSize, page: $page, name: $name, studyType: $studyType, publicationId: $publicationId, author: $author) {
      results {
        name
        qtlStudy {
          identifier
          synopsis
          description
          genotypes
          organism {
            genus
            species
          }
          dataSet {
            publication {
              firstAuthor
              pubMedId
              doi
            }
          }
        }
        gwas {
          identifier
          synopsis
          description
          genotypes
          organism {
            genus
            species
          }
          dataSet {
            publication {
              firstAuthor
              pubMedId
              doi
            }
          }
        }
      }
      pageInfo {
        currentPage
        pageSize
        numResults
        pageCount
        hasPreviousPage
        hasNextPage
      }
    }
  }
`;


/**
 * Gets traits from GraphQL.
 * @param {object} queryData - An object containing zero or more variables for the GraphQL query.
 * @param {object} pageData - An object containing pagination data for the GraphQL query, if any.
 * @param {object} options - An object containing optional parameters for the HTTP request,
 * namely, an optional `AbortSignal` instance that can be used to cancel the request mid-flight.
 * @returns {Promise} A `Promise` that resolves to the result of the GraphQL query.
 */
export function getTraits(queryData={}, pageData={}, options={}) {
  const genus = queryData.genus;
  const species = queryData.species;
  const studyType = queryData.type;
  const name = queryData.traits;
  const publicationId = queryData.pubId;
  const author = queryData.author;
  if (studyType === 'QTL') {
    studyType = 'QTLStudy';
  }
  const {page, pageSize} = pageData;
  const variables = {
    genus,
    species,
    studyType,
    name,
    publicationId,
    author,
    page,
    pageSize: 10,
  };
  const {abortSignal} = options;
  return query(getTraitsQuery, variables, abortSignal);
}

/**
 * Converts GraphQL `TraitsResults` into the `PaginatedSearchResults<TraitSearchResult[]>` used by the
 * `LisTraitSearchElement` (`<lis-trait-search-element>`) Web Component.
 * @param {object} data - An object containing the data portional of the GraphQL query HTTP response.
 * @returns {object} A `PaginatedSearchResults<TraitSearchResult[]>` object.
 */
export function traitsDataToSearchResults(data) {
  // extract the page info
  const {hasNextPage: hasNext, numResults, pageSize, pageCount: numPages} = data.traits.pageInfo;
  // flatten results
  const results = data.traits.results.map(({name, ...trait}) => {
    const type = trait.qtlStudy ? 'QTL' : 'GWAS';
    const study = trait.qtlStudy || trait.gwas;
    const {identifier, synopsis, description, genotypes} = study;
    return {
      identifier,
      type,
      synopsis,
      description,
      name,
      genotypes
    };
  });
  // return the results
  return {hasNext, numResults, pageSize, numPages, results};
}

/**
 * The trait search function to use for the `searchFunction` property of the `LisTraitAssociationSearchElement`
 * (`<lis-trait-association-search-element>`) Web Component.
 * @param {string} query - The search query.
 * @param {number} page - The page number.
 * @param {number} pageSize - The page size.
 * @param {object} options - An object containing optional parameters for the HTTP request,
 * namely, an optional `AbortSignal` instance that can be used to cancel the request mid-flight.
 * @returns {Promise} A `Promise` that resolves to the result of the GraphQL query.
 */
export function traitSearchFunction(queryData, page, options={}) {
    return getTraits(queryData, {page, pageSize: 10}, options)
      .then(({data}) => traitsDataToSearchResults(data));
}

/**
 * Creates the `traitSearchFunction` with the given callbacks applied to the returned `Promise`.
 * @param {...Function} callbacks - The callback function to apply to the returned `Promise`.
 * @returns {Promise} The `Promise` returned by the `traitSearchFunction` with the callbacks applied.
 */
export function traitSearchFunctionFactory(...callbacks) {
    return (queryData, page, options={}) => {
        let promise = traitSearchFunction(queryData, page, options);
        callbacks.forEach((callback) => {
          promise = promise.then(callback);
        });
        return promise;
    };
}

export function identifierModalLinkFactory(modalId) {
  return ({results: oldResults, ...pageInfo}) => {
    const results = oldResults.map((result) => {
      const data = {identifier: result.identifier, type: 'trait'};
      return {
        ...result,
        //identifier: modalLink(modalId, result.identifier, data)
      }
    });
    return {...pageInfo, results};    
  }
}