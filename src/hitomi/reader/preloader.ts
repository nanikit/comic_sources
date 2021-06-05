export const getPreloader = (): {
  preloadSequentially: (srcs: string[]) => Promise<any>;
  clear: () => void;
} => {
  const div = document.createElement("div");
  div.id = "extra-preload";
  div.style.display = "none";
  document.body.append(div);

  const preload = (src: string): Promise<any> => {
    const image = document.createElement("img");
    return new Promise((resolve, reject) => {
      image.addEventListener("load", resolve);
      image.addEventListener("abort", reject);
      image.addEventListener("error", reject);
      image.src = src;
      div.append(image);
    });
  };

  const preloadSequentially = async (srcs: string[]): Promise<void> => {
    for (const src of srcs) {
      await preload(src);
    }
  };

  const clear = () => {
    div.innerHTML = "";
  };

  return { preloadSequentially, clear };
};
