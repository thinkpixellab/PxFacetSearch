(function() {
    
    PxFacetSearch.ColumnType = {
        none: 'none',
        category: 'category'
    };

    // Columns store data for a single property. No indexing in basic column.

    function Column(name, values) {
        this.type = PxFacetSearch.ColumnType.none;
        this.name = name;
        this.values = values;
    }

    PxFacetSearch.Column = Column;

})();