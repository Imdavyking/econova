import { charityCategories } from "../../utils/charity.categories";
import CharityCategory from "./Category";

export default function CharityCategories() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Charity Categories
      </h2>
      <ul className="space-y-3">
        {Object.entries(charityCategories).map(
          ([categoryName, charityCategory]) => (
            <CharityCategory
              categoryName={categoryName}
              charityCategory={charityCategory}
            />
          )
        )}
      </ul>
    </div>
  );
}
