import React, { useState, useEffect } from "react";
import {
  FaUpload,
  FaLeaf,
  FaImage,
  FaCheck,
  FaArrowLeft
} from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";
import { plantsAPI, imagesAPI } from "../api/api";
import { toast } from "react-toastify";

export default function UploadImage() {

  const navigate = useNavigate();

  const [plants,setPlants]=useState([]);
  const [loading,setLoading]=useState(false);

  const [form,setForm]=useState({

    plant_id:"",
    category:"plant_photo",
    caption:"",
    source:""

  });

  const [file,setFile]=useState(null);
  const [preview,setPreview]=useState(null);

  useEffect(()=>{

    loadPlants();

  },[]);

  async function loadPlants(){

    try{

      const res=await plantsAPI.list({limit:500});

      if(res.data.success){

        setPlants(res.data.data);

      }

    }catch{

      toast.error("Failed loading plants");

    }

  }

  function handleChange(e){

    setForm({
      ...form,
      [e.target.name]:e.target.value
    });

  }

  function handleFile(e){

    const f=e.target.files[0];

    if(!f) return;

    if(!f.type.startsWith("image/")){

      toast.error("Only image allowed");
      return;

    }

    setFile(f);
    setPreview(URL.createObjectURL(f));

  }

const handleSubmit = async (e) => {

  e.preventDefault();

  if (!file || !form.plant_id) {

    toast.error("Plant and image required");
    return;

  }

  setLoading(true);

  try {

    const data = new FormData();

    data.append("image", file);

    Object.keys(form).forEach(k => {
      data.append(k, form[k]);
    });

    const response = await imagesAPI.upload(data);

    console.log("UPLOAD RESPONSE:", response);

    if (response.success) {

      toast.success("Image uploaded successfully!");

      navigate("/gallery");

    } else {

      toast.error(response.error || "Upload failed");

    }

  } catch (error) {

    console.error(error);

    toast.error("Upload failed");

  }

  setLoading(false);

};

  return(

  <div className="upload-page">

    <div className="container">

      <div className="upload-header">

        <Link to="/gallery" className="back-link">

          <FaArrowLeft/> Back

        </Link>

        <h1>

          <FaImage/> Upload Plant Image

        </h1>

      </div>

      <form onSubmit={handleSubmit} className="upload-card">

        <div className="form-group">

          <label>

            <FaLeaf/> Select Plant

          </label>

          <select
          name="plant_id"
          value={form.plant_id}
          onChange={handleChange}
          required
          >

          <option value="">Select Plant</option>

          {plants.map(p=>(

            <option key={p.id} value={p.id}>

              {p.common_name || p.scientific_name}

            </option>

          ))}

          </select>

        </div>

        <div className="form-group">

          <label>Category</label>

          <select
          name="category"
          value={form.category}
          onChange={handleChange}
          >

            <option value="plant_photo">Plant Photo</option>
            <option value="microscopic">Microscopic</option>
            <option value="artwork">Artwork</option>
            <option value="herbarium">Herbarium</option>
            <option value="other">Other</option>

          </select>

        </div>

        <div className="form-group">

          <label>Caption</label>

          <input
          name="caption"
          value={form.caption}
          onChange={handleChange}
          />

        </div>

        <div className="form-group">

          <label>Upload Image</label>

          <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          required
          />

        </div>

        {preview &&

        <div className="preview">

          <img src={preview}/>

        </div>

        }

        <button
        className="upload-btn"
        disabled={loading}
        >

        {loading ?

        "Uploading..."

        :

        <><FaUpload/> Upload Image</>

        }

        </button>

      </form>

    </div>

  </div>

  );

}