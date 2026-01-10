export const Footer = () => {
  return (
    <footer className="w-full text-center text-sm bg-gray-200 border-gray-400 text-gray-500 border-t py-8 leading-7">
      Internal demo app - Next.js + LangChain + MCP + n8n by <br />
      <strong>Pablo Losada</strong> &#169; {new Date().getFullYear()}
    </footer>
  );
};
