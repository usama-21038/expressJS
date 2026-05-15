import express, { type Application, type Request, type Response } from 'express';

import {Pool} from 'pg';

const app:Application = express();// Create a new Express application
const port = 5000;

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.text()); // Middleware to parse text request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies


const pool = new Pool({connectionString:"postgresql://neondb_owner:npg_U6lGfFRZzN2X@ep-wild-truth-aqopo8wc-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"})

// Initialize the database and create the users table if it doesn't exist
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(20),
        email VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(20) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        age INT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    console.log("Table created successfully");
  } catch (error) {
    console.log(error);
  }
};
initDB();



app.get('/', (req:Request, res:Response) => {
  // res.send('Hello World!');
  res.status(200).json({
     "message": "express server",
    "author": "next level development"
    });
});


app.post("/api/users", async(req: Request, res: Response) => {
  // Handle POST request
  // console.log(req.body); // Log the request body to the console
  const { name, email, password ,age} = req.body;

  try {
     const result =await pool.query(`
    INSERT INTO users(name,email,password,age)
    VALUES($1,$2,$3,$4) RETURNING *
    `,[name,email,password,age]);

  res.status(201).json({
    success:true,
    "message": "User created successfully",
    data:result.rows[0],
  });
  } catch (error: any) {
     res.status(500).json({
    success:false,
    "message": "Error creating user",
    error:error,
  });
  }
});

//for get all users
app.get("/api/users", async(req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM users
      `)
      res.status(200).json({
        success:true,
        message:"Users retrieved successfully",
        data:result.rows,
      })
  } catch (error: any) {
    res.status(500).json({
      success:false,
      message:error.message,
      error:error,
    })
  }
})
//for get user by id
  app.get("/api/users/:id", async(req:Request, res:Response)=>{
    const {id}=req.params;
    try {
      const result =await pool.query(`
        SELECT * FROM users WHERE id=$1
        `,[id]);

        if(result.rows.length===0){
            res.status(404).json({
          success:false,
          message:"User not found",

        })
        }

        res.status(200).json({
          success:true,
          message:"User retrieved successfully",
          data:result.rows[0],
        })
    } catch (error:any) {
      res.status(500).json({
        success:false,
        message:"Error retrieving user",
        error:error,
      })
    }

  })

//PUT request to update user by id
app.put("/api/users/:id", async(req:Request, res:Response)=>{
  const {id}=req.params;
  const {name,password,age,is_active}=req.body;

  // console.log("ID",id);
  // console.log(name,password,age,is_active);
  const result =await pool.query(`
    UPDATE users SET name=$1,password=$2,age=$3,is_active=$4
    WHERE id=$5
    `,[name,password,age,is_active,id]);
  console.log(result);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});