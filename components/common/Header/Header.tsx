import { CustomButton } from "@/components/reusable/button/CustomButton";

const Header = () => {
  return (
    <div className="flex justify-between items-center p-4 bg-amber-50">
      <h1 className="text-xl font-bold text-gray-400">This is the header</h1>
      <div className="flex gap-4">
        <CustomButton className=" bg-blue-500 text-white py-2 px-2 cursor-pointer rounded-xs ">Register</CustomButton>
        <CustomButton className=" bg-blue-600  text-white py-2 px-2 cursor-pointer rounded-xs">Login</CustomButton>
      </div>
    </div>
  );  
};

export default Header;
