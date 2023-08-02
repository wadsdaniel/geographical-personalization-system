import express from "express";
import { SuperfaceClient } from "@superfaceai/one-sdk";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", true);

const sdk = new SuperfaceClient();

async function run(ip) {
  // Load the profile
  const profile = await sdk.getProfile("address/ip-geolocation@1.0.1");

  // Use the profile
  const result = await profile.getUseCase("IpGeolocation").perform(
    {
      ipAddress: ip
    },
    {
      provider: "ipdata",
      security: {
        apikey: {
          apikey: "587a023fd9e8a83cb5d5ffb29e64d10964e7fe28df63f8a7449fabcc"
        }
      }
    }
  );

  // Handle the result
  try {
    const data = result.unwrap();
    return data;
  } catch (error) {
    console.error(error);
  }
}

app.use(express.static(path.join(__dirname, "client")));

app.get("/", async (req, res) => {   
    let geographicLocation = res.send(await run(req.ip));

    /* Here, we can target several countries or even districts or places within a country. Then we sent the customized content */    
    if (geographicLocation['addressCountry'] == 'Uganda'){
        res.sendFile(path.join(__dirname, 'client/ug.html'));
    }
    else if(geographicLocation['addressCountry'] == 'France'){
        res.sendFile(path.join(__dirname, 'client/fr.html'));    
    }else{
        /* If location cannot be specified */
        res.sendFile(path.join(__dirname, 'client/default.html'));
    }
});

app.listen(3000, () => {
  console.log("SERVER RUNNING AT PORT 3000");
});