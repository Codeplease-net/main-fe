import unknown_user from "../../public/unknown-user.jpg";
import Image from "next/image";
import { Github, Linkedin, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardTitle } from "../ui/card";
import { Link } from "@/i18n/routing";
import { developers } from "./data";

export default function DeveloperTeam() {
  const t = useTranslations("DeveloperTeam");
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-7xl mx-auto text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-teal-400 hover:scale-105 transition-all duration-700 ease-in-out animate-gradient-x">
          {t("title")}
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {developers.map((topic, index) => (
          <Card 
            key={index}
            className="group flex flex-col transform hover:scale-105 transition-all duration-700 ease-in-out border-none shadow-lg hover:shadow-2xl dark:bg-gray-800/50 backdrop-blur-sm animate-fade-up hover:ring-2 hover:ring-blue-500/20"
            style={{
              animationDelay: `${index * 150}ms`
            }}
          >
            <div className="relative w-full h-56 overflow-hidden rounded-t-xl">
              <Image
                className="object-cover transform group-hover:scale-110 transition-all duration-700 ease-in-out"
                layout="fill"
                src={topic.image ? topic.image : unknown_user}
                alt={topic.name}
                priority={index < 3}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <CardTitle className="text-2xl font-bold dark:text-white mb-2 transform group-hover:translate-x-2 transition-all duration-500">
                {topic.name}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300 transform group-hover:translate-x-2 transition-all duration-500 delay-75">
                {topic.university}
              </p>
              <div className="mt-6 transform group-hover:translate-x-2 transition-all duration-500 delay-100">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("Role")}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {topic.roles?.map((role) => (
                    <span
                      key={role}
                      className={`text-xs font-semibold px-4 py-1.5 rounded-full text-white transition-all duration-500 hover:shadow-lg hover:-translate-y-0.5 ${
                        role === "Backend"
                          ? "bg-emerald-500 hover:bg-emerald-600"
                          : role === "Judge-server"
                          ? "bg-rose-500 hover:bg-rose-600"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-auto pt-6 flex gap-4">
                {topic.githubLink && (
                  <Link
                    target="_blank"
                    href={topic.githubLink}
                    aria-label={`${topic.name} GitHub`}
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-all duration-300 hover:scale-125"
                  >
                    <Github size={22} />
                  </Link>
                )}
                {topic.linkedinLink && (
                  <Link
                    target="_blank"
                    href={topic.linkedinLink}
                    aria-label={`${topic.name} LinkedIn`}
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-all duration-300 hover:scale-125"
                  >
                    <Linkedin size={22} />
                  </Link>
                )}
                {topic.websiteLink && (
                  <Link
                    target="_blank"
                    href={topic.websiteLink}
                    aria-label={`${topic.name} Website`}
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-teal-400 transition-all duration-300 hover:scale-125"
                  >
                    <Globe size={22} />
                  </Link>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
