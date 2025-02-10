export const fetchImage = async (
  url: string,
): Promise<Buffer<ArrayBufferLike>> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Image response was not successfull. Status code: ${response.status}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return buffer;
};
