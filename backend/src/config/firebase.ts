import admin from 'firebase-admin'
import {ServiceAccount} from 'firebase-admin'

// Define the custom service account interface
interface Serviceaccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain : string;
}

const serviceAccount: Serviceaccount = {
  type: process.env.TYPE!,
  project_id: process.env.PROJECT_ID!,
  private_key_id: process.env.PRIVATE_KEY_ID!,
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDNXMDjEIhHh3M6\nwtyEImKgmJa1IKSkXnDGRNjaDB/YCETboHeuKAx08TvnjG5j+q/EH2/z0RrSrx9y\ne94GVc3n/JL4Pak8SOC3CiiZg8RT1Jsxe+fmCdwaQy4Wq2Wm5y8lOny9LMJ9dYkH\n5RmFIsvm13Q+0eR+mhnqvjShTcMjHW5GNZ9vfcByUVh+W4QCM/9hIo2wwhswnXam\nbqa3l6ye0vGcvu8Kd7cHbodv9sZgsaT/6tlVpzM4pVgkH7bwpIYBtH3iLeXC2MPz\n+lY+JvFPUeYxXwL31PWvay3UW6t9HXxbn6yq3hsAH9cEUAvHpl504C7hYeHfNKac\nBziXNS8zAgMBAAECggEAY34neRq+W6E042gau+2IyPOEOFaLTZLvoi8ivGkZWGmR\nKrKQqRCAEHv7INA5fzipxSPR8lcBXsc3Phji1UDm1Bja/2eoQSuxqxxB1TYwfMjJ\nM20rSZjHSPX5M0RwqC7i+W9flatEwtGZxPhqp8TW8oy5peG8iNWR7ted2fQ5sR2n\ni0RsbauzAxAVsrHYV5rL8Z1C3SR/K5Pt5Wc9fpUqZV/2OrfGfyOFUKlpu5wx7gnu\n52/Pgo9eFsmSPb7VAVikQqZ8mHeYpqcim1DWuXICjmGn+2LXutGMWtom2U5u1eYp\n2XwRnAL9KNiqdNKdHEdpXtZEN9TyOvya6cUMxYSoMQKBgQDzPXeGtUDCCOU9V/GL\nw8MQ60K1hKSZFtuSwr5ApwGTKk0Q9pxKiv5wVKTvriRlclRoKQDHTpl4HvBzwJ/c\nubBaO2KNeoKHHTOthJ19fam0G//lH36KyN1VGNdLgyrH/cgw7tqiQFX7JYxqJ5XY\n/PS+G/28Ctk3VaTMDalNaBQjyQKBgQDYIp28NwIS6MGfEwjpAHAEFubY2roh50q6\nJ2xLJx3JlNHEaGQNyCi//BR34HoWWVFKBOPvYxUs8/3qh6kDwrEj+9WiRPMgi7uj\nE+lY/ttMiFs3ipXjYVtvPbKxthX3TguxIY+mAp1FiEXZ6CTDn6SG+MWG8AjzrtyK\nC/G+n/ShGwKBgEWPkH0PnKNg094FJmin5UMTZJJwinnVVZnU43+twv+JG1z8iZmv\nwi/xpPF+RZ5VYdofz78vtSfrASy5K35+A/bqALchD+7/5OV8hWV76Go/j6DArvmV\nk+ZgIkHQEw36f6OuywuXhn86L7uz8mCJhpxPePKrz47JiUVpqr8eQpQxAoGBANPU\nAXIhG4g61OE6P6ZVBnQLmg55OKnXzNZrouh5GumhUIHFqiITxVR8E/d1a1KSEWiR\nKHBLVMqtC3Qbp1uHKiPRQwz5tKt2J91pu268wWPd1EC4M7UZiwqYlpUzl4280Rq2\ngNo8f7VRHNy3d6i+wvqBwN5CTRO/kmg90p14mcJ3AoGBAN7hvxL6t16djHETKApk\nshZ+09Dz38I5MNBSefNNhUqjAAMdaccj0O9OaINKMRofAPLn2kECwJOQyHbBgO2Z\n7TJ5VkUYXlsewYK2gE6TQPAquGFpmtFwPRu68Mn3AI274S0j4TpcmUy/yWM23gIe\nIATg+ESV9JC4fi0ArQ+BYPeX\n-----END PRIVATE KEY-----\n",
  client_email: process.env.CLIENT_EMAIL!,
  client_id: process.env.CLIENT_ID!,
  auth_uri: process.env.AUTH_URI!,
  token_uri: process.env.TOKEN_URI!,
  auth_provider_x509_cert_url:process.env.AUTH_PROVIDER_x509_CERT_URL!,
  client_x509_cert_url: process.env.CLIENT_x509_CERT_URL!,
  universe_domain: process.env.UNIVERSE_DOMAIN!
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount), 
});

export default admin;