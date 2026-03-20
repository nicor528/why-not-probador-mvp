import demo from "./demo.json";
import whynot from "./whynotbasics.json";
import ragucci from "./ragucci.json";

const brands = {
  demo,
  whynotbasics: whynot,
  ragucci: ragucci
};

export const loadBrand = () => {

  const brand = import.meta.env.VITE_BRAND || "demo";

  return brands[brand];

};