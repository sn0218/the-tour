class APIFeatures {
  // query: executed in MongoDB, queryString: obtained from express
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // filter query for further query chaining by class method
  filter() {
    // BUILD QUERY: deep copy of all key-value pairs
    //const queryObject = { ...this.queryString };
    const queryObject = JSON.parse(JSON.stringify(this.queryString));

    // filtering fields
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObject[el]);

    // advance filttering
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // mongoDB filtering in req param
    // {difficulty: 'easy', duration: {$gte: 5}}
    // gte, gt, lte, lt

    this.query = this.query.find(JSON.parse(queryStr));
    // prepare to build the query chain
    //let query = Tour.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // if no fields provided, set default sort
      this.query = this.query.sort({ createdAt: -1 });
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // excluding '--V' field in schema
      this.query = this.query.select('-__v');
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    //console.log(page, limit, skipPage);
    return this;
  }
}

module.exports = APIFeatures;
