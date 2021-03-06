(function() {
    
    // Intersection query across columns

    function Query(table) {
        
        this.table = table;

        this.totalCount = table.itemCount;
        this.matchCount = this.totalCount;

        // keep track of how many filters block each item
        this.blockCounts = [];
        PxFacetSearch.initArray(this.blockCounts, this.totalCount, 0);

        // cache matching ids
        this.matchIds = [];
        updateMatchIds.call(this);

        // create filters for each category column
        this.filters = [];
        this.filtersByName = {};

        // auto-create filters for known column types
        var i, len, column;
        for (i = 0, len = this.table.columns.length; i < len; i++) {
            column = this.table.columns[i];
            
            switch (column.type) {
                case PxFacetSearch.ColumnType.category:
                    this.addFilter(new PxFacetSearch.CategoryFilter(column));
                    break;
                case PxFacetSearch.ColumnType.range:
                    this.addFilter(new PxFacetSearch.RangeFilter(column));
                    break;
            }
        }

        this.updateCallbacks = [];
    }

    // private method to update cached ids
    function updateMatchIds() {
        this.matchIds = [];

        var i, len;
        for (i = 0, len = this.blockCounts.length; i < len; i++) {
            if (this.blockCounts[i] === 0) {
                this.matchIds.push(i);
            }
        }
    }

    Query.prototype.addFilter = function(filter) {
        PxFacetSearch.initArray(filter.matches, this.table.itemCount, true);
        this.filters.push(filter);
        this.filtersByName[filter.name] = filter;
    };

    Query.prototype.getFilterMatches = function(name) {    
        return this.filtersByName[name].matches;
    };

    Query.prototype.onUpdate = function(callback) {
        this.updateCallbacks.push(callback);
    };

    Query.prototype.select = function(columnName, query) {

        var filter = this.filtersByName[columnName],
            changes = filter.select(query),
            isGlobalChange = false,
            id, i, len;
        
        // change block counts for added items
        for (i = changes.addIds.length; i--; ) {
            id = changes.addIds[i];
            if ((--this.blockCounts[id]) === 0) {
                this.matchCount++;
                isGlobalChange = true;
            }
        }

        // update block counts for removed items
        for (i = changes.removeIds.length; i--; ) {
            id = changes.removeIds[i];
            if ((++this.blockCounts[id]) === 1) {
                this.matchCount--;
                isGlobalChange = true;
            }
        }

        if (isGlobalChange) {
            updateMatchIds.call(this);

            for (i = 0, len = this.updateCallbacks.length; i < len; i++) {
                this.updateCallbacks[i](columnName);
            }
        }

    };  

    PxFacetSearch.Query = Query;

})();