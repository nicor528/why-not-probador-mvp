import demo from "./demo.json";
import whynot from "./whynotbasics.json";

const brands = {
  demo,
  whynotbasics: whynot
};

export const loadBrand = () => {

  const brand = import.meta.env.VITE_BRAND || "demo";

  return brands[brand];

};