class API_filtering {
  constructor(query, userQueryString) {
    this.query = query;
    this.userQueryString = userQueryString;
  }

  filter() {
    const queryObj = { ...this.userQueryString };
    const excludesFields = ["page", "sort", "limit", "fields"];
    excludesFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    
    const parsedQuery = JSON.parse(queryStr);
    //flitering based on tags
    if (queryObj.projectTags) {
      const tagsArray = queryObj.projectTags.split(","); 
      parsedQuery.projectTags = { $all: tagsArray };
    }
    

    this.query.find(parsedQuery); 
    return this;
  }

  paginate() {
    const page = this.userQueryString.page * 1 || 1; // Default to page 1
    const limit = this.userQueryString.limit * 1 || 10; // Default to limit of 10
    const skip = (page - 1) * limit;

    this.query.skip(skip).limit(limit); // Apply pagination
    return this;
  }

  sort() {
    if (this.userQueryString.sort) {
      const sortBy = this.userQueryString.sort.split(",").join(" "); // Split by comma for multiple sorting fields
      this.query.sort(sortBy); // Apply sorting
    }
    return this;
  }
}

module.exports = API_filtering;
