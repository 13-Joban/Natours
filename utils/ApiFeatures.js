class APIFeatures{
    constructor(query, queryString){
        this.query = query; this.queryString=queryString
    }
    
    filter(){

         // 1) Filtering

         const reqObj = {...this.queryString};
       
         const excludedFileds = ['page', 'sort', 'limit', 'fields']
 
         excludedFileds.forEach(el => delete reqObj[el])
 
         // console.log(req.query, reqObj);
        
         
             // 1.1) Advance Filtering
              let   queryStr = JSON.stringify(reqObj);
              queryStr  = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
             // console.log(JSON.parse(queryString));
         
          
               this.query.find(JSON.parse(queryStr));
             return this;
    }

    sort(){
        if(this.queryString.sort){
            
            console.log(this.queryString.sort)
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy);
            // sort() func provided by mongoose

            

        }
        else{
            // console.log(req.query.sort);
            // recent on top
            this.query = this.query.sort('-createdAt')
        }
        return this;
    }

    limiting(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            
        this.query = this.query.select(fields);

        }
        else{
            this.query  = this.query .select('-__v')
        }
        return this;
    }

    paginate(){
        
        const page = this.queryString.page*1 || 1;
        const limit = this.queryString.limit*1 || 100;

           const skipdocs = (page - 1)*limit;

      this.query = this.query.skip(skipdocs).limit(limit)
        return this;
    }

}
module.exports = APIFeatures;